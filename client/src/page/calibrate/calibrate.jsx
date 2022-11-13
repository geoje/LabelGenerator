import {
  ActionIcon,
  Center,
  Grid,
  Group,
  NumberInput,
  Paper,
  Popover,
  SegmentedControl,
  Select,
  Skeleton,
  Text,
} from "@mantine/core";
import {
  IconArrowBigDown,
  IconArrowBigDownLines,
  IconArrowBigRight,
  IconArrowBigRightLines,
  IconFileHorizontal,
  IconLayoutBoardSplit,
  IconRuler3,
} from "@tabler/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  UNIT,
  PAPER_TYPE,
  DEFAULT_PAPER_SIZE,
  convertSize,
  setLayout,
} from "./paperSlice";
import { DETAIL_ICON_SIZE } from "../design/drawSlice";

const ADJ_TOOL_SIZE = 21;

function PaperSize() {
  const dispatch = useDispatch();
  const drawLayout = useSelector((state) => state.draw.layout);
  const paperLayout = useSelector((state) => state.paper.layout);

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
              value: PAPER_TYPE.fit,
              label: SegLabel(<IconFileHorizontal />, "Fit content"),
            },
            {
              value: PAPER_TYPE.letter,
              label: SegLabel(<IconLayoutBoardSplit />, "Letter"),
            },
            {
              value: PAPER_TYPE.a4,
              label: SegLabel(<IconLayoutBoardSplit />, "A4"),
            },
            {
              value: PAPER_TYPE.custom,
              label: SegLabel(<IconLayoutBoardSplit />, "Custom"),
              disabled:
                isSameSize(drawLayout, paperLayout) ||
                isSameSize(DEFAULT_PAPER_SIZE.letter, paperLayout) ||
                isSameSize(DEFAULT_PAPER_SIZE.a4, paperLayout),
            },
          ]}
          value={
            isSameSize(drawLayout, paperLayout)
              ? PAPER_TYPE.fit
              : isSameSize(DEFAULT_PAPER_SIZE.letter, paperLayout)
              ? PAPER_TYPE.letter
              : isSameSize(DEFAULT_PAPER_SIZE.a4, paperLayout)
              ? PAPER_TYPE.a4
              : PAPER_TYPE.custom
          }
          onChange={(value) => {
            if (value === PAPER_TYPE.custom) return;
            dispatch(
              setLayout({
                ...(Object.keys(DEFAULT_PAPER_SIZE).includes(value)
                  ? {
                      ...convertSize(
                        paperLayout,
                        DEFAULT_PAPER_SIZE[value].unit
                      ),
                      ...DEFAULT_PAPER_SIZE[value],
                    }
                  : {
                      ...convertSize(paperLayout, drawLayout.unit),
                      ...drawLayout,
                    }),
                type: value,
              })
            );
          }}
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          size="xs"
          min={0}
          precision={2}
          step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
          value={paperLayout.w}
          onChange={(value) =>
            dispatch(
              setLayout({
                ...paperLayout,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          size="xs"
          min={0}
          precision={2}
          step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
          value={paperLayout.h}
          onChange={(value) =>
            dispatch(
              setLayout({
                ...paperLayout,
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
          value={paperLayout.unit}
          onChange={(value) => {
            if (value === paperLayout.unit) return;
            dispatch(setLayout(convertSize(paperLayout, value)));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}

function PaperAdjust() {
  const dispatch = useDispatch();
  const drawLayoutPx = convertSize(
    useSelector((state) => state.draw.layout),
    UNIT.px
  );
  const paperLayout = useSelector((state) => state.paper.layout);
  const paperLayoutPx = convertSize(paperLayout, UNIT.px);

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

  const items = (() => {
    const result = [];

    for (
      let y = paperLayoutPx.t;
      y <= paperLayoutPx.h - drawLayoutPx.h;
      y += drawLayoutPx.h + paperLayoutPx.b
    )
      for (
        let x = paperLayoutPx.l;
        x <= paperLayoutPx.w - drawLayoutPx.w;
        x += drawLayoutPx.w + paperLayoutPx.r
      )
        result.push(
          <Skeleton
            key={"skeleton" + result.length}
            sx={{
              position: "absolute",
              left: x * paperRatio,
              top: y * paperRatio,
              width: drawLayoutPx.w * paperRatio,
              height: drawLayoutPx.h * paperRatio,
              opacity: 0.8,
            }}
          />
        );

    return result;
  })();

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
        {items}

        <Popover width={140} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              sx={{
                position: "absolute",
                left: paperLayoutPx.l * paperRatio - ADJ_TOOL_SIZE,
                top:
                  (paperLayoutPx.t + drawLayoutPx.h / 2) * paperRatio -
                  ADJ_TOOL_SIZE / 2,
                borderRight: `2px solid`,
                borderRadius: 0,
              }}
              size={ADJ_TOOL_SIZE}
              variant="transparent"
              color="blue.6"
            >
              <IconArrowBigRight />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <NumberInput
              size="xs"
              min={0}
              description={paperLayout.unit}
              precision={2}
              step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
              value={paperLayout.l}
              onChange={(value) =>
                dispatch(setLayout({ ...paperLayout, l: value }))
              }
            />
          </Popover.Dropdown>
        </Popover>
        <Popover width={140} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              sx={{
                position: "absolute",
                left:
                  (paperLayoutPx.l + drawLayoutPx.w / 2) * paperRatio -
                  ADJ_TOOL_SIZE / 2,
                top: paperLayoutPx.t * paperRatio - ADJ_TOOL_SIZE,
                borderBottom: `2px solid`,
                borderRadius: 0,
              }}
              size={ADJ_TOOL_SIZE}
              variant="transparent"
              color="blue.6"
            >
              <IconArrowBigDown />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <NumberInput
              size="xs"
              min={0}
              description={paperLayout.unit}
              precision={2}
              step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
              value={paperLayout.t}
              onChange={(value) =>
                dispatch(setLayout({ ...paperLayout, t: value }))
              }
            />
          </Popover.Dropdown>
        </Popover>
        <Popover width={140} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              sx={{
                position: "absolute",
                left: (paperLayoutPx.l + drawLayoutPx.w) * paperRatio,
                top:
                  (paperLayoutPx.t + drawLayoutPx.h / 2) * paperRatio -
                  ADJ_TOOL_SIZE / 2,
                borderLeft: `2px solid`,
                borderRadius: 0,
              }}
              size={ADJ_TOOL_SIZE}
              variant="transparent"
              color="blue.6"
            >
              <IconArrowBigRightLines />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <NumberInput
              size="xs"
              min={0}
              description={paperLayout.unit}
              precision={2}
              step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
              value={paperLayout.r}
              onChange={(value) =>
                dispatch(setLayout({ ...paperLayout, r: value }))
              }
            />
          </Popover.Dropdown>
        </Popover>
        <Popover width={140} position="bottom" withArrow shadow="md">
          <Popover.Target>
            <ActionIcon
              sx={{
                position: "absolute",
                left:
                  (paperLayoutPx.l + drawLayoutPx.w / 2) * paperRatio -
                  ADJ_TOOL_SIZE / 2,
                top: (paperLayoutPx.t + drawLayoutPx.h) * paperRatio,
                borderTop: `2px solid`,
                borderRadius: 0,
              }}
              size={ADJ_TOOL_SIZE}
              variant="transparent"
              color="blue.6"
            >
              <IconArrowBigDownLines />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown>
            <NumberInput
              size="xs"
              min={0}
              description={paperLayout.unit}
              precision={2}
              step={paperLayout.unit === UNIT.inch ? 0.1 : 1}
              value={paperLayout.b}
              onChange={(value) =>
                dispatch(setLayout({ ...paperLayout, b: value }))
              }
            />
          </Popover.Dropdown>
        </Popover>
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
