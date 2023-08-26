import {
  ActionIcon,
  Center,
  NumberInput,
  Paper,
  Popover,
  Skeleton,
} from "@mantine/core";
import {
  IconArrowBigDown,
  IconArrowBigDownLines,
  IconArrowBigRight,
  IconArrowBigRightLines,
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import {
  UNIT,
  convertSize,
  setLayout,
  MAX_PRECISION,
  STEP_BY_UNIT,
  ADJ_TOOL_SIZE,
} from "@/lib/paperSlice";

export function Adjust() {
  const dispatch = useDispatch();
  const drawLayoutPx = convertSize(
    useSelector((state: any) => state.draw.layout),
    UNIT.px
  );
  const paperLayout = useSelector((state: any) => state.paper.layout);
  const paperLayoutPx = convertSize(paperLayout, UNIT.px);

  const items = (() => {
    const result = [];

    for (
      let y = paperLayoutPx.t, i = 1;
      y <= paperLayoutPx.h - drawLayoutPx.h;
      y += drawLayoutPx.h + paperLayoutPx.b
    )
      for (
        let x = paperLayoutPx.l;
        x <= paperLayoutPx.w - drawLayoutPx.w;
        x += drawLayoutPx.w + paperLayoutPx.r, i++
      )
        result.push(
          <Skeleton
            key={"skeleton" + result.length}
            radius="lg"
            sx={{
              position: "absolute",
              left: x * paperLayout.ratio,
              top: y * paperLayout.ratio,
              width: drawLayoutPx.w * paperLayout.ratio,
              height: drawLayoutPx.h * paperLayout.ratio,
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
          width: paperLayoutPx.w * paperLayout.ratio,
          height: paperLayoutPx.h * paperLayout.ratio,
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
                left: paperLayoutPx.l * paperLayout.ratio - ADJ_TOOL_SIZE,
                top:
                  (paperLayoutPx.t + drawLayoutPx.h / 2) * paperLayout.ratio -
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
              precision={MAX_PRECISION}
              step={STEP_BY_UNIT[paperLayout.unit]}
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
                  (paperLayoutPx.l + drawLayoutPx.w / 2) * paperLayout.ratio -
                  ADJ_TOOL_SIZE / 2,
                top: paperLayoutPx.t * paperLayout.ratio - ADJ_TOOL_SIZE,
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
              precision={MAX_PRECISION}
              step={STEP_BY_UNIT[paperLayout.unit]}
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
                left: (paperLayoutPx.l + drawLayoutPx.w) * paperLayout.ratio,
                top:
                  (paperLayoutPx.t + drawLayoutPx.h / 2) * paperLayout.ratio -
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
              precision={MAX_PRECISION}
              step={STEP_BY_UNIT[paperLayout.unit]}
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
                  (paperLayoutPx.l + drawLayoutPx.w / 2) * paperLayout.ratio -
                  ADJ_TOOL_SIZE / 2,
                top: (paperLayoutPx.t + drawLayoutPx.h) * paperLayout.ratio,
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
              precision={MAX_PRECISION}
              step={STEP_BY_UNIT[paperLayout.unit]}
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
