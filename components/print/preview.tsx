import "./print.css";
import { Group, Text, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useSelector } from "react-redux";
import { FixedSizeList } from "react-window";
import NewWindow from "react-new-window";
import { UNIT, containerHeight, convertSize } from "@/lib/paperSlice";
import { calculatePageMap } from "@/lib/printSlice";
import { showNotification } from "@mantine/notifications";
import { LabelPaper } from "./labelPaper";

export function Preview() {
  // Provider
  const data = useSelector((state: any) => state.data.value);
  const drawLayoutPx = convertSize(
    useSelector((state: any) => state.draw.layout),
    UNIT.px
  );
  const paperLayoutPx = convertSize(
    useSelector((state: any) => state.paper.layout),
    UNIT.px
  );

  const [reqPrint, setReqPrint] = useState(null);

  const condition = useSelector((state: any) => state.copy.condition);
  const exclude = useSelector((state: any) => state.copy.exclude);
  const pageMap = calculatePageMap(
    data,
    paperLayoutPx,
    drawLayoutPx,
    condition,
    exclude
  );

  const Row = ({ index, style }: any) => (
    <Stack
      key={"preview-" + index}
      align="flex-start"
      spacing={1}
      style={style}
    >
      <Group
        style={{
          width: paperLayoutPx.w,
          margin: "0 auto",
        }}
        spacing="xs"
        align="flex-end"
        noWrap
      >
        <Title order={6} color="gray">
          {index + 1}p
        </Title>
        {Array.from(new Set(pageMap[index]).values())
          .filter((page) => page !== -1)
          .map((page, i) => {
            const count = pageMap[index].filter((p: any) => p === page).length;
            return (
              <Text size="xs" color="gray" key={"preview-subtitle-" + i}>
                {`#${page}${count > 1 ? `(${count})` : ""}`}
              </Text>
            );
          })}
      </Group>
      <div
        style={{
          border: "1px solid rgb(222, 226, 230)",
          margin: "0 auto",
        }}
      >
        <LabelPaper
          preview
          pageMapIndex={index}
          pages={pageMap[index]}
          onPrint={() => setReqPrint(index)}
        />
      </div>
      {reqPrint === index && (
        // Here make DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
        // There is CORS problem. But we can ignore it.
        <NewWindow
          title="Print Labels"
          onUnload={() => {
            setReqPrint(null);
          }}
          onBlock={() =>
            showNotification({
              title: "New window opening blocked",
              message: "The browser restricts opening a new window",
              color: "red",
            })
          }
          onOpen={(w: any) => {
            w.moveTo(0, 0);
            w.resizeTo(window.screen.availWidth, window.screen.availHeight);
            w.print();
          }}
        >
          <LabelPaper pages={pageMap[index]} />
        </NewWindow>
      )}
    </Stack>
  );

  return (
    <>
      <FixedSizeList
        width="100%"
        height={containerHeight()}
        className="List"
        itemCount={pageMap.length}
        itemSize={paperLayoutPx.h + 30}
        overscanCount={0}
      >
        {Row}
      </FixedSizeList>
    </>
  );
}
