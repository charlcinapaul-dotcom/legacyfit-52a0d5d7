export interface Queen {
  name: string;
  domain: string;
  truth: string;
  quote: string;
}

export const QUEENS: Queen[] = [
  {
    name: "Sojourner Truth",
    domain: "Resistance",
    truth: "She walked out of slavery and turned around to walk others through.",
    quote: '"I am not going to die, I\'m going home like a shooting star."',
  },
  {
    name: "Wilma Rudolph",
    domain: "Endurance",
    truth: "Polio at 4. Triple gold at 20. Your body knows more than its history.",
    quote: '"Never underestimate the power of dreams and the influence of the human spirit."',
  },
  {
    name: "Ida B. Wells",
    domain: "Truth",
    truth: "When the truth was dangerous, she printed it anyway.",
    quote: '"The way to right wrongs is to turn the light of truth upon them."',
  },
  {
    name: "Fannie Lou Hamer",
    domain: "Voice",
    truth: "Beaten for trying to vote. She came back louder.",
    quote: '"I\'m sick and tired of being sick and tired."',
  },
  {
    name: "Toni Morrison",
    domain: "Story",
    truth: "She didn't wait for permission to tell the truth.",
    quote: '"If you have some power, then your job is to empower somebody else."',
  },
  {
    name: "Katherine Johnson",
    domain: "Precision",
    truth: "Her math sent men to the moon. Her name stayed hidden for decades.",
    quote: '"Like what you do, and then you will do your best."',
  },
  {
    name: "Maya Angelou",
    domain: "Rising",
    truth: "She turned every wound into a word that healed someone else.",
    quote: '"You may not control all the events that happen to you, but you can decide not to be reduced by them."',
  },
  {
    name: "Malala Yousafzai",
    domain: "Courage",
    truth: "They silenced her once. She became the loudest voice on earth.",
    quote: '"One child, one teacher, one book, one pen can change the world."',
  },
  {
    name: "Ruth Bader Ginsburg",
    domain: "Justice",
    truth: "She was the first, the second, the dissent. She never stopped.",
    quote: '"Fight for the things that you care about, but do it in a way that will lead others to join you."',
  },
  {
    name: "Eleanor Roosevelt",
    domain: "Dignity",
    truth: "No one can make you feel inferior without your consent.",
    quote: '"No one can make you feel inferior without your consent."',
  },
  {
    name: "Jane Goodall",
    domain: "Patience",
    truth: "She went into the jungle alone and came back with the truth about humanity.",
    quote: '"What you do makes a difference, and you have to decide what kind of difference you want to make."',
  },
];

export interface RouteStop {
  num: string;
  title: string;
  queenLabel: string;
  desc: string;
  dist: string;
  distLabel: string;
}

export const ROUTE_STOPS: RouteStop[] = [
  {
    num: "01",
    title: "Sojourner Truth",
    queenLabel: "ABOLITIONIST · 1797–1883",
    desc: "Born into bondage, she escaped on foot and never stopped moving. She sued for her son's freedom, lectured across the country, and met Abraham Lincoln. Her body was a declaration.",
    dist: "0.5",
    distLabel: "mile",
  },
  {
    num: "02",
    title: "Ida B. Wells",
    queenLabel: "JOURNALIST & ACTIVIST · 1862–1931",
    desc: "She investigated lynchings when no one else would, published the findings, and walked back into danger every time she was threatened. Her pen was her stride.",
    dist: "1.0",
    distLabel: "mile",
  },
  {
    num: "03",
    title: "Eleanor Roosevelt",
    queenLabel: "DIPLOMAT & HUMANITARIAN · 1884–1962",
    desc: "She moved through a life of expectations — and refused every single one that tried to shrink her. She redefined what a First Lady could do for the world.",
    dist: "1.5",
    distLabel: "mile",
  },
  {
    num: "04",
    title: "Wilma Rudolph",
    queenLabel: "OLYMPIC CHAMPION · 1940–1994",
    desc: "Doctors said she'd never walk. She became the fastest woman on earth. Polio at 4. Triple gold at 20. Her stride rewrote what the body is capable of.",
    dist: "2.0",
    distLabel: "mile",
  },
  {
    num: "05",
    title: "Fannie Lou Hamer",
    queenLabel: "CIVIL RIGHTS LEADER · 1917–1977",
    desc: "Beaten for trying to vote, she came back louder. She walked onto the national stage and declared herself sick and tired — and then kept going anyway.",
    dist: "2.5",
    distLabel: "mile",
  },
  {
    num: "06",
    title: "Maya Angelou",
    queenLabel: "POET & AUTHOR · 1928–2014",
    desc: "She turned every wound into a word that healed someone else. She rose. Every time. And her words still rise with every woman who reads them.",
    dist: "3.0",
    distLabel: "mile",
  },
  {
    num: "07",
    title: "Katherine Johnson",
    queenLabel: "NASA MATHEMATICIAN · 1918–2020",
    desc: "She computed orbital trajectories by hand. The astronauts wouldn't launch until she confirmed the math. Her genius was hidden for decades. It was always there.",
    dist: "3.5",
    distLabel: "mile",
  },
  {
    num: "08",
    title: "Ruth Bader Ginsburg",
    queenLabel: "SUPREME COURT JUSTICE · 1933–2020",
    desc: "She was the first, the second, the dissent. She fought in courtrooms when women couldn't get credit cards. She never stopped until her last breath.",
    dist: "4.0",
    distLabel: "mile",
  },
  {
    num: "09",
    title: "Malala Yousafzai",
    queenLabel: "EDUCATION ACTIVIST · 1997–",
    desc: "They tried to silence her. She came back louder. She walked onto the Nobel stage at 17 and spoke for every girl still waiting for her seat.",
    dist: "4.3",
    distLabel: "mile",
  },
  {
    num: "10",
    title: "Toni Morrison",
    queenLabel: "NOBEL LAUREATE · 1931–2019",
    desc: "She wrote the stories that weren't supposed to be written. She put Black women at the center of American literature and dared the world to look away.",
    dist: "4.7",
    distLabel: "mile",
  },
  {
    num: "11",
    title: "Jane Goodall",
    queenLabel: "PRIMATOLOGIST & ACTIVIST · 1934–",
    desc: "She walked into the forests of Tanzania with a notebook and changed how we understand life on earth. She has walked for the planet every day since.",
    dist: "5.0",
    distLabel: "mile",
  },
];
