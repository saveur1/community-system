export type CommunitySession = {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'audio';
  url: string;
  thumbnail: string;
  uploadedAt: string;
};

export const communitySessions: CommunitySession[] = [
  {
    id: '1',
    title: 'Hand Washing Awareness',
    description: 'A short video demonstrating proper hand washing techniques to prevent the spread of germs.',
    type: 'video',
    url: 'https://example.com/videos/hand-washing.mp4',
    thumbnail: 'https://i.ytimg.com/vi/e1-p3zN_i4k/maxresdefault.jpg',
    uploadedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Community Cleanup Drive',
    description: 'Photo gallery from our successful community cleanup event last weekend.',
    type: 'image',
    url: 'https://example.com/images/cleanup-1.jpg',
    thumbnail: 'https://environment.co.za/wp-content/uploads/2019/07/Community-cleanup-in-Diepsloot-2.jpg',
    uploadedAt: '2024-05-18T15:30:00Z',
  },
  {
    id: '3',
    title: 'Interview with Dr. Anya',
    description: 'An audio interview with Dr. Anya discussing mental health and well-being.',
    type: 'audio',
    url: 'https://example.com/audio/interview-dr-anya.mp3',
    thumbnail: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsynsf-322w5s2Ohk-a5E-GZk1i_z3-q9Q9A&s',
    uploadedAt: '2024-05-15T09:00:00Z',
  },
  {
    id: '4',
    title: 'Nutrition Workshop',
    description: 'Photos from the workshop on balanced diets for families.',
    type: 'image',
    url: 'https://example.com/images/nutrition-workshop.jpg',
    thumbnail: 'https://www.compass-group.com/content/dam/compass-group/corporate/sustainability/health-and-wellbeing/Woman-giving-a-nutrition-workshop-1200x630.jpg',
    uploadedAt: '2024-05-12T14:00:00Z',
  },
  {
    id: '5',
    title: 'Yoga for Beginners',
    description: 'A guided yoga session for all ages to promote physical health.',
    type: 'video',
    url: 'https://example.com/videos/yoga-for-beginners.mp4',
    thumbnail: 'https://i.ytimg.com/vi/v7AYKMP6rOE/maxresdefault.jpg',
    uploadedAt: '2024-05-10T11:00:00Z',
  },
  {
    id: '6',
    title: 'Local Market Day',
    description: 'Highlights from the bustling local market day.',
    type: 'image',
    url: 'https://example.com/images/market-day.jpg',
    thumbnail: 'https://www.wslhd.health.nsw.gov.au/Images/UserUploadedImages/1163/market-day-banner-2023.jpg',
    uploadedAt: '2024-05-08T12:00:00Z',
  },
  {
    id: '7',
    title: 'Story Time for Kids',
    description: 'An audio recording of a classic children\'s story.',
    type: 'audio',
    url: 'https://example.com/audio/story-time.mp3',
    thumbnail: 'https://www.thesaurus.com/e/wp-content/uploads/2022/07/20220725_story_time_1000x700.jpg',
    uploadedAt: '2024-05-05T16:00:00Z',
  },
  {
    id: '8',
    title: 'Gardening Club Meetup',
    description: 'Video tour of the community garden and interviews with members.',
    type: 'video',
    url: 'https://example.com/videos/gardening-club.mp4',
    thumbnail: 'https://www.rhs.org.uk/getmedia/162f80ec-353d-4467-8451-bfa23f1c9257/Community-gardening-header.jpg?width=800&height=533&ext=.jpg',
    uploadedAt: '2024-05-02T18:00:00Z',
  },
];
