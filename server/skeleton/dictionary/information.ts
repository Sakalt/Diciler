//

import {
  Information
} from "/server/model/dictionary";
import {
  Skeleton
} from "/server/skeleton/skeleton";


export class InformationSkeleton extends Skeleton {

  public title!: string;
  public text!: string;

  public static from(raw: Information): InformationSkeleton {
    let title = raw.title;
    let text = raw.text;
    let skeleton = InformationSkeleton.of({title, text});
    return skeleton;
  }

  public static empty(): InformationSkeleton {
    let title = "";
    let text = "";
    let skeleton = InformationSkeleton.of({title, text});
    return skeleton;
  }

}