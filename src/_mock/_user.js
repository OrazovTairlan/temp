import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'banned', label: 'Banned' },
  { value: 'rejected', label: 'Rejected' },
];

export const _userAbout = {
  id: _mock.id(1),
  role: _mock.role(1),
  email: _mock.email(1),
  school: _mock.companyNames(2),
  company: _mock.companyNames(1),
  country: _mock.countryNames(2),
  coverUrl: _mock.image.cover(3),
  totalFollowers: _mock.number.nativeL(1),
  totalFollowing: _mock.number.nativeL(2),
  quote:
    'Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..',
  socialLinks: {
    facebook: `https://www.facebook.com/caitlyn.kerluke`,
    instagram: `https://www.instagram.com/caitlyn.kerluke`,
    linkedin: `https://www.linkedin.com/in/caitlyn.kerluke`,
    twitter: `https://www.twitter.com/caitlyn.kerluke`,
  },
};

export const _userFollowers = [...Array(18)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  country: _mock.countryNames(index),
  avatarUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/RIAN_archive_440215_Kurchatov_city.jpg",
}));

export const _userFriends = [...Array(18)].map((_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));


const KAZAKHSTAN_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s', // Charyn Canyon
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTem30Yh9Z0FVazIl2x5AhDBcY-DlVjB_0TMw&s'
];

export const _userGallery = [...Array(12)].map((_, index) => ({
  id: _mock.id(index),
  postedAt: _mock.time(index),
  title: _mock.postTitle(index),
  imageUrl: KAZAKHSTAN_IMAGES[index],
}));

const KAZAKH_MEDIA_IMAGES = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiuPFKHCfCPf2S71DlivpYyAuPgCwXSJKV7A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiuPFKHCfCPf2S71DlivpYyAuPgCwXSJKV7A&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiuPFKHCfCPf2S71DlivpYyAuPgCwXSJKV7A&s'
];

const KAZAKH_MESSAGES = [
  'Вечерняя Астана просто волшебна! Обожаю огни нашего города. 🏙️✨ #Астана #Казахстан',
  'Как же красиво и душевно прошел Наурыз в этом году! Наша культура - наша гордость. 🌷☀️ #Наурыз #традиции',
  'Покоряем вершины Шымбулака! Невероятные виды и свежий горный воздух. 🏔️❄️ #Шымбулак #горы #Алматы',
];

const KAZAKH_AVATARS = [
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMLjLuPQJge2mZzE1zt7XBFw5Hwf4ECuV1RQ&s'
];

// --- Конец данных для казахстанского контекста ---


export const _userFeeds = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  createdAt: _mock.time(index),
  media: KAZAKH_MEDIA_IMAGES[index],
  message: KAZAKH_MESSAGES[index],
  personLikes: [...Array(20)].map((__, personIndex) => ({
    name: _mock.fullName(personIndex),
    avatarUrl: KAZAKH_AVATARS[personIndex % KAZAKH_AVATARS.length], // Используем аватары по кругу
  })),
  comments: (index === 2 && []) || [ // Оставляем комментарии только для первых двух постов для разнообразия
    {
      id: _mock.id(7),
      author: {
        id: _mock.id(8),
        avatarUrl: KAZAKH_AVATARS[5],
        name: _mock.fullName(5),
      },
      createdAt: _mock.time(2),
      message: 'Керемет! Өте әдемі көрініс.',
    },
    {
      id: _mock.id(9),
      author: {
        id: _mock.id(10),
        avatarUrl: KAZAKH_AVATARS[6],
        name: _mock.fullName(6),
      },
      createdAt: _mock.time(3),
      message: 'Согласен, наше наследие - это то, чем стоит гордиться!',
    },
  ],
}));

export const _userCards = [...Array(21)].map((_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  coverUrl: _mock.image.cover(index),
  avatarUrl: _mock.image.avatar(index),
  totalFollowers: _mock.number.nativeL(index),
  totalPosts: _mock.number.nativeL(index + 2),
  totalFollowing: _mock.number.nativeL(index + 1),
}));

export const _userPayment = [...Array(3)].map((_, index) => ({
  id: _mock.id(index),
  cardNumber: ['**** **** **** 1234', '**** **** **** 5678', '**** **** **** 7878'][index],
  cardType: ['mastercard', 'visa', 'visa'][index],
  primary: index === 1,
}));

export const _userAddressBook = [...Array(4)].map((_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  phoneNumber: _mock.phoneNumber(index),
  fullAddress: _mock.fullAddress(index),
  addressType: (index === 0 && 'Home') || 'Office',
}));

export const _userInvoices = [...Array(10)].map((_, index) => ({
  id: _mock.id(index),
  invoiceNumber: `INV-199${index}`,
  createdAt: _mock.time(index),
  price: _mock.number.price(index),
}));

export const _userPlans = [
  { subscription: 'basic', price: 0, primary: false },
  { subscription: 'starter', price: 4.99, primary: true },
  { subscription: 'premium', price: 9.99, primary: false },
];

export const _userList = [...Array(20)].map((_, index) => ({
  id: _mock.id(index),
  zipCode: '85807',
  state: 'Virginia',
  city: 'Rancho Cordova',
  role: _mock.role(index),
  email: _mock.email(index),
  address: '908 Jack Locks',
  name: _mock.fullName(index),
  isVerified: _mock.boolean(index),
  company: _mock.companyNames(index),
  country: _mock.countryNames(index),
  avatarUrl: _mock.image.avatar(index),
  phoneNumber: _mock.phoneNumber(index),
  status:
    (index % 2 && 'pending') || (index % 3 && 'banned') || (index % 4 && 'rejected') || 'active',
}));
