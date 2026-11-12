/** Family-event settings. Edit this file to customize the invitation. */
export const EVENT = {
  babyName: "Ryn",
  parentNames: "Kath & Tracey",
  dateLabel: "Sunday, December 13, 2026",
  ceremonyTime: "10:00 AM",
  ceremonyVenue: "Our Lady of Sacred Heart Parish Cebu",
  ceremonyAddress: "15 N. Escario St., Cebu City, 6000 Cebu",
  luncheonTime: "12:00 PM",
  luncheonVenue: "Casa Pelaez Cebu x The Tavern (Small) Music Hall Cebu",
  luncheonAddress: "2F, Queensland Manor, Rahmann St, Cebu City, 6000 Cebu",
  ceremonyMapUrl:
    "https://www.google.com/maps/search/?api=1&query=Our+Lady+of+Sacred+Heart+Parish+Cebu+15+N.+Escario+St.,+Cebu+City,+6000+Cebu",
  luncheonMapUrl: "https://maps.app.goo.gl/hVk58p2Q3ch3FEaD8",
  routeMapUrl: "https://maps.app.goo.gl/vTWJEtmr1gNjx83Q6",
  rsvpDeadline: "2026-12-01",
  organizerName: "Marie",
  organizerPhoneDisplay: "+63 991 364 9022",
  organizerEmail: "efypuyot@gmail.com",
  organizerPhoneDial: "+639913649022",
  maxAttendeesPerFamily: 20,
};

/**
 * Replace this sample with the ACTUAL godparent list before sharing publicly.
 * Names/aliases must be explicit. Godparent names here are visible in client code.
 * Do not repeat an alias across multiple people.
 */
export const GODPARENTS = [
  {
    name: "Marie",
    role: "Ninang",
    slug: "ninang-marie", // baby-ryn-rsvp.vercel.app/ninang-marie
    letter: {
      teaser: "An extra-special little note, just for you.",
      paragraphs: [
        "Mommy and Daddy chose you, Ninang Marie, to be one of the special people who will help guide me on my journey of faith.",
        "Right now my world is filled with tiny hands, sleepy smiles, and lots of cuddles. One day, when I am bigger, I hope I can count on your prayers, your advice, and your love as I learn about the world.",
        "Thank you for being part of my story from the very beginning. Having you as my Ninang makes this day even more special to our family.",
      ],
      closing: "I can't wait to see you on my christening day!",
    },
  },
  // Copy this object for each Ninong or Ninang, then customize the letter:
  // {
  //   name: "Juan Dela Cruz",
  //   role: "Ninong",
  //   slug: "ninong-juan",
  //   letter: {
  //     teaser: "A little message from Baby Ryn.",
  //     paragraphs: ["Write a truly personal paragraph here..."],
  //     closing: "See you on my special day!",
  //   },
  // },
];

export const PHOTO_PATHS = {
  main: "/images/ryn-main.jpg",
  letter: "/images/ryn-letter.jpg",
  rsvp: "/images/ryn-rsvp.jpg",
};
