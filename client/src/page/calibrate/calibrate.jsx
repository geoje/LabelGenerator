import {
  ActionIcon,
  Center,
  Grid,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Select,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  IconArrowsHorizontal,
  IconArrowsVertical,
  IconFileHorizontal,
  IconLayoutBoardSplit,
  IconRuler3,
} from "@tabler/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  UNIT,
  convertSize,
  setPaperSize,
  DEFAULT_PAPER_SIZE,
} from "./paperSlice";
import { DETAIL_ICON_SIZE } from "../design/drawSlice";

const ADJ_TOOL_SIZE = 21;

function PaperSize() {
  const dispatch = useDispatch();
  const drawLayout = useSelector((state) => state.draw.layout);
  const PaperLayout = useSelector((state) => state.paper.layout);

  const SegLabel = (icon, content) => (
    <Group noWrap>
      {icon}
      <Text>{content}</Text>
    </Group>
  );
  const isSameSize = (size1, size2) =>
    convertSize(size1, size2.unit).w === size2.w &&
    convertSize(size1, size2.unit).h === size2.h;

  return (
    <Grid>
      <Grid.Col>
        <SegmentedControl
          size="md"
          color="blue"
          orientation="vertical"
          fullWidth
          data={[
            {
              value: "fit",
              label: SegLabel(<IconFileHorizontal />, "Fit content"),
            },
            {
              value: "letter",
              label: SegLabel(<IconLayoutBoardSplit />, "Letter"),
            },
            {
              value: "a4",
              label: SegLabel(<IconLayoutBoardSplit />, "A4"),
            },
            {
              value: "custom",
              label: SegLabel(<IconLayoutBoardSplit />, "Custom"),
            },
          ]}
          value={
            isSameSize(drawLayout, PaperLayout)
              ? "fit"
              : isSameSize(DEFAULT_PAPER_SIZE.letter, PaperLayout)
              ? "letter"
              : isSameSize(DEFAULT_PAPER_SIZE.a4, PaperLayout)
              ? "a4"
              : "custom"
          }
          onChange={(value) =>
            dispatch(
              setPaperSize(
                Object.keys(DEFAULT_PAPER_SIZE).includes(value)
                  ? DEFAULT_PAPER_SIZE[value]
                  : value === "custom"
                  ? { ...drawLayout, w: drawLayout.w * 2 }
                  : drawLayout
              )
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={PaperLayout.w}
          size="xs"
          precision={PaperLayout.unit === UNIT.inch ? 2 : 0}
          step={PaperLayout.unit === UNIT.inch ? 0.1 : 1}
          onChange={(value) =>
            dispatch(
              setPaperSize({
                ...PaperLayout,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={PaperLayout.h}
          size="xs"
          precision={PaperLayout.unit === UNIT.inch ? 2 : 0}
          step={PaperLayout.unit === UNIT.inch ? 0.1 : 1}
          onChange={(value) =>
            dispatch(
              setPaperSize({
                ...PaperLayout,
                h: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={12} xl={4}>
        <Select
          placeholder="Unit"
          icon={<IconRuler3 size={DETAIL_ICON_SIZE} />}
          size="xs"
          transitionDuration={100}
          transition="pop-top-left"
          transitionTimingFunction="ease"
          data={Object.keys(UNIT).map((s) => {
            return { value: s, label: s };
          })}
          value={PaperLayout.unit}
          onChange={(value) => {
            if (value === PaperLayout.unit) return;
            dispatch(setPaperSize(convertSize(PaperLayout, value)));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}

function PaperAdjust() {
  const drawLayoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const paperLayoutPx = convertSize(
    useSelector((state) => state.paper.layout),
    UNIT.px
  );
  const gap = useSelector((state) => state.paper.gap);

  const containerSize = {
    w: Math.floor(((window.innerWidth - 30) / 6) * 5 - 20),
    h: window.innerHeight - 140,
  };
  const paperRatio =
    paperLayoutPx.w < containerSize.w && paperLayoutPx.h < containerSize.h
      ? 1
      : containerSize.w / paperLayoutPx.w < containerSize.h / paperLayoutPx.h
      ? containerSize.w / paperLayoutPx.w
      : containerSize.h / paperLayoutPx.h;

  return (
    <Center>
      <Paper
        sx={{
          position: "relative",
          width: paperLayoutPx.w * paperRatio,
          height: paperLayoutPx.h * paperRatio,
          boxSizing: "content-box",
          background: "#fff",
        }}
        radius={0}
        withBorder
        shadow="xs"
      >
        <Skeleton
          width={drawLayoutPx.w * paperRatio}
          height={drawLayoutPx.h * paperRatio}
        />
        <ActionIcon
          sx={{
            position: "absolute",
            left: ((gap.l - ADJ_TOOL_SIZE) / 2) * paperRatio,
            top: (gap.t + (drawLayoutPx.h - ADJ_TOOL_SIZE) / 2) * paperRatio,
          }}
          size={ADJ_TOOL_SIZE}
          variant="transparent"
        >
          <IconArrowsHorizontal />
        </ActionIcon>
        <ActionIcon
          sx={{
            position: "absolute",
            left: (gap.l + (drawLayoutPx.w - ADJ_TOOL_SIZE) / 2) * paperRatio,
            top: ((gap.t - ADJ_TOOL_SIZE) / 2) * paperRatio,
          }}
          size={ADJ_TOOL_SIZE}
          variant="transparent"
        >
          <IconArrowsVertical />
        </ActionIcon>
      </Paper>
    </Center>
  );
}

export default function Calibrate() {
  return (
    <Grid m={0} p="sm" pt="lg">
      <Grid.Col md={2}>
        <PaperSize />
      </Grid.Col>
      <Grid.Col md={10}>
        <PaperAdjust />
      </Grid.Col>
    </Grid>
  );
}
