//

import {
  IntlError
} from "@formatjs/intl";
import {
  Outlet,
  ReactLocation,
  Route,
  Router
} from "@tanstack/react-location";
import * as queryParser from "query-string";
import {
  ReactElement,
  useCallback
} from "react";
import {
  DndProvider
} from "react-dnd";
import {
  HTML5Backend as DndBackend
} from "react-dnd-html5-backend";
import {
  IntlProvider
} from "react-intl";
import {
  QueryClientProvider
} from "react-query";
import {
  RecoilRoot
} from "recoil";
import {
  create
} from "/client/component/create";
import {
  queryClient,
  useDefaultLocale,
  useDefaultMe,
  useDefaultTheme
} from "/client/component/hook";
import InnerRoot from "/client/component/inner-root";
import {
  loadDashboardPage,
  loadDictionaryListPage,
  loadDictionarySettingPage,
  loadDocumentPage,
  loadExamplePage,
  loadNotificationPage,
  loadTopPage
} from "/client/component/page/loader";
import {
  createRoute
} from "/client/component/util/route";


require("../../node_modules/codemirror/lib/codemirror.css");
require("../../node_modules/c3/c3.css");

const location = new ReactLocation({
  parseSearch: (searchString) => queryParser.parse(searchString),
  stringifySearch: (search) => queryParser.stringify(search)
});
const routes = [
  ...createRoute("/login", () => import("/client/component/page/login-page"), {type: "guest", redirect: "/dashboard"}),
  ...createRoute("/register", () => import("/client/component/page/register-page"), {type: "guest", redirect: "/dashboard"}),
  ...createRoute("/reset", () => import("/client/component/page/reset-user-password-page"), {type: "guest", redirect: "/dashboard"}),
  ...createRoute("/activate", () => import("/client/component/page/activate-user-page"), {type: "none"}),
  ...createRoute("/dashboard/dictionary/:number", () => import("/client/component/page/dictionary-setting-page"), {type: "private", redirect: "/login", loader: loadDictionarySettingPage}),
  ...createRoute("/dashboard", () => import("/client/component/page/dashboard-page"), {type: "private", redirect: "/login", loader: loadDashboardPage}),
  ...createRoute("/dictionary/:value", () => import("/client/component/page/dictionary-page"), {type: "none"}),
  ...createRoute("/example/:number", () => import("/client/component/page/example-page"), {type: "none", loader: loadExamplePage}),
  ...createRoute("/list", () => import("/client/component/page/dictionary-list-page"), {type: "none", loader: loadDictionaryListPage}),
  ...createRoute("/notification", () => import("/client/component/page/notification-page"), {type: "none", loader: loadNotificationPage}),
  ...createRoute("/contact", () => import("/client/component/page/contact-page"), {type: "none"}),
  ...createRoute("/document/:firstPath/:secondPath", () => import("/client/component/page/document-page"), {type: "none", loader: loadDocumentPage}),
  ...createRoute("/document/:firstPath", () => import("/client/component/page/document-page"), {type: "none", loader: loadDocumentPage}),
  ...createRoute("/document", () => import("/client/component/page/document-page"), {type: "none", loader: loadDocumentPage}),
  ...createRoute("/", () => import("/client/component/page/top-page"), {type: "none", loader: loadTopPage})
] as Array<Route>;


const Root = create(
  require("./root.scss"), "Root",
  function ({
  }: {
  }): ReactElement | null {

    const {ready} = useDefaultMe();
    const {locale, messages} = useDefaultLocale("ja");
    useDefaultTheme("light");

    const handleIntlError = useCallback(function (error: IntlError<any>): void {
      if (error.code !== "MISSING_DATA" && error.code !== "MISSING_TRANSLATION") {
        console.error(error);
      }
    }, []);

    const node = (ready) && (
      <DndProvider backend={DndBackend}>
        <QueryClientProvider client={queryClient}>
          <IntlProvider defaultLocale="ja" locale={locale} messages={messages} onError={handleIntlError} fallbackOnEmptyString={false}>
            <RecoilRoot>
              <Router location={location} routes={routes} caseSensitive={true}>
                <InnerRoot>
                  <Outlet/>
                </InnerRoot>
              </Router>
            </RecoilRoot>
          </IntlProvider>
        </QueryClientProvider>
      </DndProvider>
    );
    return node || null;

  }
);


export default Root;