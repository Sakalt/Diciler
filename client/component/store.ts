//

import {
  boundAction,
  observable
} from "/client/component/decorator";
import {
  DetailedUser
} from "/server/skeleton/user";


export class GlobalStore {

  @observable
  public locale: string = GlobalStore.getDefaultLocale();

  @observable
  public user: DetailedUser | null = null;

  @observable
  public popupSpecs: Array<PopupSpec> = [];

  @boundAction
  public changeLocale(locale: string): void {
    this.locale = locale;
    localStorage.setItem("locale", locale);
  }

  private static getDefaultLocale(): string {
    return localStorage.getItem("locale") ?? "ja";
  }

  private addPopup(type: string, style: PopupStyle, timeout: number | null): void {
    let date = new Date();
    let id = date.getTime();
    this.popupSpecs.push({id, type, style});
    if (timeout !== null) {
      setTimeout(() => this.clearPopup(id), timeout);
    }
  }

  @boundAction
  public addErrorPopup(type: string, timeout: number | null = 5000): void {
    this.addPopup(type, "error", timeout);
  }

  @boundAction
  public addInformationPopup(type: string, timeout: number | null = 5000): void {
    this.addPopup(type, "information", timeout);
  }

  @boundAction
  public clearPopup(id: number): void {
    this.popupSpecs = this.popupSpecs.filter((spec) => spec.id !== id);
  }

  @boundAction
  public clearAllPopups(): void {
    this.popupSpecs = [];
  }

}


type PopupStyle = "error" | "information";
type PopupSpec = {id: number, type: string, style: PopupStyle};