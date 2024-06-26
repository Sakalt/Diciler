//

import {modelOptions, prop} from "@typegoose/typegoose";


@modelOptions({schemaOptions: {autoCreate: false, collection: "dictionaryFonts"}})
export class DictionaryFontSchema {

  @prop({required: true})
  public type!: string;

  @prop()
  public name?: string;

  @prop()
  public format?: string;

}


export type DictionaryFont = DictionaryFontSchema;