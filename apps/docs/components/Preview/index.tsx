export { InputOrGroup } from "@/core/components/InputOrGroup";

import { ReactNode, useReducer, useState } from "react";
import "@/core/styles/global.css";
import { AppProvider, defaultAppState } from "@/core/components/Puck/context";
import { PuckAction, createReducer } from "@/core/reducer";
import { InputOrGroup } from "@/core/components/InputOrGroup";
import { AppState, ComponentConfig, Config, Data } from "@/core/types/Config";
import { rootDroppableId } from "@/core/lib/root-droppable-id";
import { getClassNameFactory } from "@/core/lib";

import styles from "./styles.module.css";

const getClassNamePreview = getClassNameFactory("Preview", styles);
const getClassNameConfigPreview = getClassNameFactory("ConfigPreview", styles);

const PreviewApp = ({
  children,
  config,
  data,
}: {
  children: (
    appState: AppState,
    dispatch: (action: PuckAction) => void
  ) => ReactNode;
  config: Config;
  data: Data;
}) => {
  const [reducer] = useState(() => createReducer({ config }));
  const [appState, dispatch] = useReducer(reducer, {
    ...defaultAppState,
    data,
  });

  return (
    <AppProvider
      value={{
        state: appState,
        dispatch,
        config,
        componentState: {},
      }}
    >
      {children(appState, dispatch)}
    </AppProvider>
  );
};

export const Preview = ({
  children,
  config = { components: {} },
  data,
  label,
  render,
  padding = 16,
}: {
  children?: ReactNode;
  config?: Config;
  data?: Data;
  label: string;
  render?: (
    appState: AppState,
    dispatch: (action: PuckAction) => void
  ) => ReactNode;
  padding?: number;
}) => {
  return (
    <PreviewApp config={config} data={data}>
      {(appState, dispatch) => (
        <div className={getClassNamePreview()}>
          {label && <div className={getClassNamePreview("label")}>{label}</div>}
          <div
            style={{
              padding,
            }}
          >
            {typeof render !== "undefined" ? render(appState, dispatch) : null}
            {children}
          </div>
        </div>
      )}
    </PreviewApp>
  );
};

export const ConfigPreview = ({
  componentConfig,
  label,
}: {
  componentConfig: ComponentConfig;
  label: string;
}) => {
  return (
    <Preview
      config={{ components: { Example: componentConfig } }}
      data={{
        content: [
          {
            type: "Example",
            props: { ...componentConfig.defaultProps, id: "example" },
          },
        ],
        root: {},
      }}
      label={label}
      padding={0}
      render={(appState, dispatch) => (
        <div className={getClassNameConfigPreview()}>
          <div className={getClassNameConfigPreview("field")}>
            {Object.keys(componentConfig.fields).map((name) => (
              <InputOrGroup
                key={name}
                name={name}
                field={componentConfig.fields[name]}
                value={appState.data["content"][0].props[name]}
                onChange={(val) =>
                  dispatch({
                    type: "replace",
                    destinationIndex: 0,
                    destinationZone: rootDroppableId,
                    data: {
                      ...appState.data.content[0],
                      props: {
                        ...appState.data.content[0].props,
                        [name]: val,
                      },
                    },
                  })
                }
              />
            ))}
          </div>
          <div className={getClassNameConfigPreview("preview")}>
            {componentConfig.render({
              ...appState.data["content"][0].props,
              puck: { renderDropZone: () => <div /> },
            })}
          </div>
        </div>
      )}
    />
  );
};
