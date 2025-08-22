import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface TweetAttributes {
  id: string;
  tweetId: string;
  text: string;
  authorId: string | null;
  authorUsername: string | null;
  createdAtTweet: Date | null;
  data: Record<string, unknown> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type TweetCreationAttributes = Optional<TweetAttributes, 'id' | 'authorId' | 'authorUsername' | 'createdAtTweet' | 'data' | 'createdAt' | 'updatedAt'>;

export class Tweet extends Model<TweetAttributes, TweetCreationAttributes> implements TweetAttributes {
  declare id: string;
  declare tweetId: string;
  declare text: string;
  declare authorId: string | null;
  declare authorUsername: string | null;
  declare createdAtTweet: Date | null;
  declare data: Record<string, unknown> | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Tweet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tweetId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authorUsername: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAtTweet: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    data: {
      type: DataTypes.JSON, // Using JSON type for MySQL compatibility
      allowNull: true,
      field: 'data',
    },
  },
  {
    sequelize,
    tableName: 'tweets',
    modelName: 'Tweet',
    indexes: [
      { unique: true, fields: ['tweetId'] },
      { fields: ['createdAtTweet'] },
    ],
  }
);

export default Tweet;
