//

import {
  AdvancedWordParameter,
  DetailedDictionary,
  Dictionary,
  Example,
  Word
} from "/client/skeleton/dictionary";
import {
  User
} from "/client/skeleton/user";
import {
  createDummyText
} from "/client/util/misc";


export const DUMMY_USER = {
  id: "1",
  name: "user",
  screenName: "Dummy user"
} as User;

export const DUMMY_DICTIONARY = {
  id: "1",
  number: 1,
  paramName: "dictionary",
  name: "Dummy dictionary",
  status: "ready",
  secret: false,
  explanation: createDummyText(10),
  settings: {
    punctuations: [","],
    pronunciationTitle: "Pronunciation",
    exampleTitle: "Examples",
    enableMarkdown: true
  },
  createdDate: "2012-01-23T12:34:56.789Z",
  updatedDate: "2022-12-03T12:34:56.789Z"
} as Dictionary;

export const DUMMY_DETAILED_DICTIONARY = {
  ...DUMMY_DICTIONARY,
  user: DUMMY_USER
} as DetailedDictionary;

export const DUMMY_WORD = {
  id: "1",
  number: 1,
  name: "Dummy word",
  pronunciation: "/dʌmi/",
  tags: ["Tag 1", "Tag 2"],
  equivalents: [{
    titles: ["Noun"],
    names: ["Equivalent 1", "Equivalent 2", "Equivalent 3"]
  }, {
    titles: ["Adjective"],
    names: ["Equivalent 1", "Equivalent 2"]
  }],
  informations: [{
    title: "Etymology",
    text: createDummyText(3)
  }, {
    title: "Usage",
    text: createDummyText(10)
  }],
  variations: [{
    title: "Plural",
    name: "words"
  }],
  relations: [{
    titles: ["Antonym"],
    number: 2,
    name: "Antonym word"
  }],
  createdDate: "2012-01-23T12:34:56.789Z",
  updatedDate: "2022-12-03T12:34:56.789Z"
} as Word;

export const DUMMY_EXAMPLE = {
  id: "1",
  number: 1,
  words: [{
    number: 1,
    name: "Dummy word"
  }, {
    number: 3,
    name: "Another dummy word"
  }],
  sentence: "This is a dummy sentence.",
  translation: "This is a dummy translation."
} as Example;

export const DUMMY_ZATLIN_SOURCE = `
  cons = "k" | "g" | "t" | "d" | "p" | "b" | "s" | "h";
  vowel = "a" | "i" | "o" | "u";
  diph = ("a" | "o") ("i" | "u");
  long = vowel &1;
  syll = cons (vowel | diph | long) ("" | cons);
  % syll | syll syll;
`;

export const DUMMY_ADVANCED_WORD_PARAMETER = Object.assign(AdvancedWordParameter.createEmpty(), {
  elements: [{
    text: "Search 1",
    title: "Tag 1",
    mode: "name",
    type: "suffix"
  }, {
    text: "Search 2",
    title: "Tag 2",
    mode: "content",
    type: "part"
  }]
});