import {
  ActionIcon,
  Group,
  Text,
  Paper,
  Title,
  Overlay,
  Tooltip,
  Divider,
} from "@mantine/core";
import {
  IconCircleMinus,
  IconCirclePlus,
  IconInfoCircle,
  IconPrinter,
} from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UNIT, convertSize } from "@/lib/paperSlice";
import { addExclude, delExclude } from "@/lib/printSlice";
import { Canvas } from "./canvas";
import { useTranslation } from "next-i18next";

export function LabelPaper(props: any) {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.data.value);
  const drawLayoutPx = convertSize(
    useSelector((state: any) => state.draw.layout),
    UNIT.px
  );
  const paperLayoutPx = convertSize(
    useSelector((state: any) => state.paper.layout),
    UNIT.px
  );
  const { t } = useTranslation();
  let x = paperLayoutPx.l,
    y = paperLayoutPx.t;

  let [hovers, setHovers] = useState([]);

  return (
    <Paper
      sx={{
        position: "relative",
        width: paperLayoutPx.w,
        height: paperLayoutPx.h,
        boxSizing: "content-box",
        background: "#fff",
      }}
      radius={0}
    >
      {props.pages.map((page: any, i: any) => {
        const item =
          page !== -1 ? (
            <div
              key={"paper-entry-" + i}
              style={{ position: "absolute", left: x, top: y }}
              onMouseEnter={
                props.preview
                  ? () => {
                      const temp: any = [];
                      temp[i] = true;
                      setHovers(temp);
                    }
                  : undefined
              }
              onMouseLeave={
                props.preview
                  ? () => {
                      const temp: any = [];
                      temp[i] = false;
                      setHovers(temp);
                    }
                  : undefined
              }
            >
              <Canvas page={page} />
              {hovers[i] && (
                <Overlay
                  opacity={1}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    placeContent: "center",
                    gap: 8,
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <Tooltip
                    label={t("Exclude")}
                    withArrow
                    styles={(theme) => {
                      return {
                        tooltip: {
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? "rgba(37, 38, 43, 0.8)"
                              : "rgba(33, 37, 41, 0.8)",
                          whiteSpace: "nowrap",
                        },
                      };
                    }}
                  >
                    <ActionIcon
                      variant="transparent"
                      onClick={() =>
                        dispatch(addExclude([props.pageMapIndex, i]))
                      }
                    >
                      <IconCircleMinus color="white" />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    label={t("Print")}
                    withArrow
                    styles={(theme) => {
                      return {
                        tooltip: {
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? "rgba(37, 38, 43, 0.8)"
                              : "rgba(33, 37, 41, 0.8)",
                          whiteSpace: "nowrap",
                        },
                      };
                    }}
                  >
                    <ActionIcon variant="transparent" onClick={props.onPrint}>
                      <IconPrinter color="white" />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip
                    position="right"
                    withArrow
                    multiline
                    label={
                      <>
                        <Title order={5} align="center">
                          # {page}
                        </Title>
                        <Divider my={4} />
                        {Object.entries(data[page]).map(([k, v]: any, j) => (
                          <Group
                            key={`tooltip-${page}-${j}`}
                            spacing="xs"
                            noWrap
                          >
                            <Title order={6}>{k}</Title>
                            <Text size="xs">{v}</Text>
                          </Group>
                        ))}
                      </>
                    }
                    styles={(theme) => {
                      return {
                        tooltip: {
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? "rgba(37, 38, 43, 0.8)"
                              : "rgba(33, 37, 41, 0.8)",
                          whiteSpace: "nowrap",
                        },
                      };
                    }}
                  >
                    <ActionIcon
                      variant="transparent"
                      style={{
                        cursor: "default",
                        transform: "none",
                      }}
                    >
                      <IconInfoCircle color="white" />
                    </ActionIcon>
                  </Tooltip>
                </Overlay>
              )}
            </div>
          ) : props.preview ? (
            <div
              key={"paper-entry-" + i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: drawLayoutPx.w,
                height: drawLayoutPx.h,

                display: "flex",
                flexWrap: "wrap",
                placeContent: "center",
                gap: 8,

                border: "1px solid #868e96",
                borderStyle: "dashed",
              }}
            >
              <Tooltip label={t("Include")} withArrow>
                <ActionIcon
                  variant="transparent"
                  onClick={() => dispatch(delExclude([props.pageMapIndex, i]))}
                >
                  <IconCirclePlus color="#868e96" />
                </ActionIcon>
              </Tooltip>
            </div>
          ) : null;

        x += drawLayoutPx.w + paperLayoutPx.r;
        // if item overflow from paper
        if (x >= paperLayoutPx.w - drawLayoutPx.w) {
          x = paperLayoutPx.l;
          y += drawLayoutPx.h + paperLayoutPx.b;
        }

        return item;
      })}
    </Paper>
  );
}
