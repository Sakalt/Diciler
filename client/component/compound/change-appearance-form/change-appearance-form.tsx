/* eslint-disable react/jsx-closing-bracket-location, no-useless-computed-key */

import {faAngleDown, faPalette} from "@fortawesome/sharp-regular-svg-icons";
import {ReactElement, useCallback} from "react";
import {
  AdditionalProps,
  GeneralIcon,
  Menu,
  MenuItem,
  useChangeTheme,
  useTrans
} from "zographia";
import {create} from "/client/component/create";
import {APPEARANCES, Appearance, THEMES, Theme} from "/client/constant/appearance";
import {useChangeAppearance} from "/client/hook/appearance";


export const ChangeAppearanceForm = create(
  require("./change-appearance-form.scss"), "ChangeAppearanceForm",
  function ({
    ...rest
  }: {
    className?: string
  } & AdditionalProps): ReactElement {

    const {trans} = useTrans("changeAppearanceForm");

    const changeAppearance = useChangeAppearance();
    const changeTheme = useChangeTheme();

    const changeAppearanceAndTheme = useCallback(function (colorDefinitionType: Appearance, theme: Theme): void {
      changeAppearance(colorDefinitionType);
      changeTheme(theme);
    }, [changeAppearance, changeTheme]);

    return (
      <Menu styleName="root" triggerType="click" placement="bottom-end" {...rest} trigger={(
        <button styleName="trigger" type="button">
          <GeneralIcon styleName="icon" icon={faPalette}/>
          <span styleName="label">{trans("label")}</span>
          <GeneralIcon styleName="angle" icon={faAngleDown}/>
        </button>
      )}>
        {APPEARANCES.map((appearance) => THEMES.map((theme) => (
          <MenuItem styleName="item" key={`${appearance}-${theme}`} onClick={() => changeAppearanceAndTheme(appearance, theme)}>
            {trans(`appearance.${appearance}`)} · {trans(`theme.${theme}`)}
          </MenuItem>
        )))}
      </Menu>
    );

  }
);
