//

import Queue from "bull";
import {
  REDIS_URI
} from "/server/variable";


export const uploadDictionaryQueue = new Queue("uploadDictionary", REDIS_URI);