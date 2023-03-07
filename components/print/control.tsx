import {
  ActionIcon,
  Group,
  Badge,
  Select,
  Stack,
  Button,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCopy,
  IconFilter,
  IconPrinter,
  IconRotate,
  IconVariable,
} from "@tabler/icons-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NewWindow from "react-new-window";
import { DETAIL_ICON_SIZE } from "@/lib/drawSlice";
import { UNIT, convertSize } from "@/lib/paperSlice";
import {
  calculatePageMap,
  MAX_COUNT,
  qtyPerPaper,
  RECOMMENDED_COUNT,
  setCondition,
  setExclude,
} from "@/lib/printSlice";
import { showNotification } from "@mantine/notifications";
import { PrintModal } from "./printModal";
import { LabelPaper } from "./labelPaper";
import { useTranslation } from "next-i18next";

export function Control() {
  // Provider
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

  const [reqPrint, setReqPrint] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  const condition = useSelector((state: any) => state.print.condition);
  const exclude = useSelector((state: any) => state.print.exclude);
  const pageMap = calculatePageMap(
    data,
    paperLayoutPx,
    drawLayoutPx,
    condition,
    exclude
  );

  const calculateLabelCount = () =>
    qtyPerPaper(paperLayoutPx, drawLayoutPx) * (pageMap.length - 1) +
    pageMap[pageMap.length - 1].length -
    Object.keys(exclude).reduce(
      (acc, cur) => acc + Object.keys(exclude[cur]).length,
      0
    );

  return (
    <Stack pt="xl" align="center" spacing="xs">
      {Object.keys(exclude).length > 0 && (
        <Button
          size="xs"
          mb="md"
          leftIcon={<IconRotate size={DETAIL_ICON_SIZE} />}
          onClick={() => dispatch(setExclude({}))}
        >
          {t("Clear exclude")}
        </Button>
      )}

      <Group noWrap>
        <Select
          size="xs"
          placeholder={t("Filter column") ?? "Filter column"}
          clearable
          icon={<IconFilter size={DETAIL_ICON_SIZE} />}
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
          data={Object.keys(data.length ? data[0] : []).map((s) => {
            return { value: s, label: s };
          })}
          value={condition.filterFormat}
          onChange={(value) => {
            if (value === condition.filterFormat) return;
            dispatch(
              setCondition({
                ...condition,
                filterFormat: value,
                filterValue: null,
              })
            );
          }}
        />
        <Select
          size="xs"
          placeholder={t("Filter value") ?? "Filter value"}
          disabled={!condition.filterFormat}
          icon={<IconVariable size={DETAIL_ICON_SIZE} />}
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
          data={
            condition.filterFormat
              ? Array.from(
                  new Set(
                    new Array(data.length)
                      .fill(0)
                      .map((_, i) => data[i][condition.filterFormat])
                  ).values()
                )
                  .map((v) => {
                    return { value: v, label: v };
                  })
                  .sort((a, b) => (a.value < b.value ? -1 : 1))
              : []
          }
          value={condition.filterValue}
          onChange={(value) =>
            dispatch(setCondition({ ...condition, filterValue: value }))
          }
        />
      </Group>
      <Select
        size="xs"
        mt="md"
        placeholder={t("Copies column") ?? "Copies column"}
        clearable
        icon={<IconCopy size={DETAIL_ICON_SIZE} />}
        transitionDuration={100}
        transition="pop-top-left"
        transitionTimingFunction="ease"
        data={Object.keys(data.length ? data[0] : []).map((s) => {
          return { value: s, label: s };
        })}
        value={condition.qtyFormat}
        onChange={(value) =>
          dispatch(setCondition({ ...condition, qtyFormat: value }))
        }
      />

      <Badge
        variant={pageMap.length > RECOMMENDED_COUNT ? "filled" : "outline"}
        color={pageMap.length > RECOMMENDED_COUNT ? "red" : "gray"}
        size="xs"
      >
        {pageMap.length}
      </Badge>

      <Tooltip label={t("Print all")} position="bottom" withArrow>
        <ActionIcon
          size={128}
          variant="filled"
          radius="md"
          onClick={() => {
            if (pageMap.length > MAX_COUNT)
              showNotification({
                title: t("Too many quantity"),
                message: t(
                  "The system cannot print more than {0} copies"
                ).replace("{0}", MAX_COUNT.toLocaleString()),
                color: "red",
              });
            else open();
          }}
        >
          <IconPrinter size={128} />
        </ActionIcon>
      </Tooltip>
      <PrintModal
        qty={pageMap.length}
        useCredit={calculateLabelCount()}
        opened={opened}
        close={close}
        onAgree={() => {
          setReqPrint(true);
          close();
        }}
      />

      {reqPrint && (
        // Here make DOMException: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules
        // There is CORS problem. But we can ignore it.
        <NewWindow
          title="Print Labels"
          onUnload={() => {
            setReqPrint(false);
          }}
          onBlock={() =>
            showNotification({
              title: t("New window opening blocked"),
              message: t("The browser restricted opening a new window"),
              color: "red",
            })
          }
          onOpen={(w: any) => {
            w.moveTo(0, 0);
            w.resizeTo(window.screen.availWidth, window.screen.availHeight);
            w.print();
          }}
        >
          {pageMap.map((pages: any, i: any) => (
            <LabelPaper pages={pages} key={"paper-" + i} />
          ))}
        </NewWindow>
      )}
    </Stack>
  );
}
