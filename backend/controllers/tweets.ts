import { Controller, Get, Route, Tags, Response } from 'tsoa';
import { ServiceResponse } from '@/utils/serviceResponse';
import Tweet from '@/models/tweet';
import { asyncCatch } from '@/middlewares/errorHandler';

interface ITweetResponse {
  id: string;
  text: string;
  authorId: string;
  authorUsername: string;
  createdAtTweet: string; // Stored as ISO string for API responses
  data: Record<string, unknown>;
}

// Public Tweets controller
@Route('api/tweets')
@Tags('Tweets')
export class TweetsController extends Controller {
  /**
   * Returns up to 5 latest tweets. Tries X API v2 first; if it fails, falls back to the last 5 saved in DB.
   */
  /**
   * Get the latest tweets
   * @returns Latest tweets with metadata
   */
  @Get('latest')
  @Response<ServiceResponse<ITweetResponse[]>>(200, 'Successfully retrieved tweets')
  @Response<ServiceResponse<{ error: string }>>(500, 'Failed to fetch tweets')
  @asyncCatch
  public async getLatestTweets(): Promise<ServiceResponse<ITweetResponse[] | { error: string }>> {
    const bearer = process.env.X_BEARER_TOKEN;
    const userId = process.env.X_USER_ID;

    // Helper function to transform Tweet model to ITweetResponse
    const toTweetResponse = (tweet: any): ITweetResponse => {
      const createdAt = typeof tweet.createdAtTweet === 'string' 
        ? new Date(tweet.createdAtTweet).toISOString() 
        : tweet.createdAtTweet?.toISOString() || new Date().toISOString();
        
      return {
        id: tweet.tweetId,
        text: tweet.text,
        authorId: tweet.authorId,
        authorUsername: tweet.authorUsername,
        createdAtTweet: createdAt,
        data: tweet.data || {}
      };
    };

    // Always have a DB fallback ready
    const dbFallback = async (): Promise<ITweetResponse[]> => {
      const tweets = await Tweet.findAll({
        limit: 5,
        order: [['createdAtTweet', 'DESC']],
      });
      return tweets.map(toTweetResponse);
    };

    // Try to fetch from X API if credentials are available
    if (bearer && userId) {
      try {
        const response = await fetch(
          `https://api.x.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at,public_metrics,author_id&expansions=author_id&user.fields=username`,
          {
            headers: {
              Authorization: `Bearer ${bearer}`,
            },
          }
        );

        console.log(response);

        if (!response.ok) throw new Error('Failed to fetch from X API');

        const data = await response.json();
        const users = data.includes?.users?.reduce((acc: any, user: any) => ({
          ...acc,
          [user.id]: user.username,
        }), {});

        // Save new tweets to DB
        const tweetData = data.data || [];
        const savedTweets = await Promise.all(
          tweetData.map(async (tweet: any) => {
            const tweetDate = tweet.created_at ? new Date(tweet.created_at) : new Date();
            const [savedTweet] = await Tweet.upsert(
              {
                tweetId: tweet.id,
                text: tweet.text,
                authorId: tweet.author_id,
                authorUsername: users[tweet.author_id] || 'unknown',
                createdAtTweet: tweetDate,
                data: tweet,
              },
              {
                conflictFields: ['tweetId'],
                returning: true,
              }
            );
            return savedTweet;
          })
        );

        return ServiceResponse.success('Tweets retrieved successfully', savedTweets.map(toTweetResponse));
      } catch (error) {
        console.error('Error fetching from X API, falling back to DB:', error);
        // Fall through to DB
      }
    }

    // Fallback to database if X API fails or no credentials
    try {
      const tweets = await dbFallback();
      return ServiceResponse.success('Tweets retrieved from database', tweets);
    } catch (error) {
      console.error('Error fetching tweets from database:', error);
      return ServiceResponse.failure('Failed to fetch tweets', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}
