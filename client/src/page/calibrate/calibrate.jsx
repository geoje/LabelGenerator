import {
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Text,
} from "@mantine/core";
import {
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

function PaperSize() {
  const dispatch = useDispatch();
  const layout = useSelector((state) => state.draw.layout);
  const paper = useSelector((state) => state.paper.size);

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
            isSameSize(layout, paper)
              ? "fit"
              : isSameSize(DEFAULT_PAPER_SIZE.letter, paper)
              ? "letter"
              : isSameSize(DEFAULT_PAPER_SIZE.a4, paper)
              ? "a4"
              : "custom"
          }
          onChange={(value) =>
            dispatch(
              setPaperSize(
                Object.keys(DEFAULT_PAPER_SIZE).includes(value)
                  ? DEFAULT_PAPER_SIZE[value]
                  : value === "custom"
                  ? { ...layout, w: layout.w * 2 }
                  : layout
              )
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={paper.w}
          size="xs"
          precision={paper.unit === UNIT.inch ? 2 : 0}
          step={paper.unit === UNIT.inch ? 0.1 : 1}
          onChange={(value) =>
            dispatch(
              setPaperSize({
                ...paper,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={paper.h}
          size="xs"
          precision={paper.unit === UNIT.inch ? 2 : 0}
          step={paper.unit === UNIT.inch ? 0.1 : 1}
          onChange={(value) =>
            dispatch(
              setPaperSize({
                ...paper,
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
          value={paper.unit}
          onChange={(value) => {
            if (value === paper.unit) return;
            dispatch(setPaperSize(convertSize(paper, value)));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}

function PaperAdjust() {
  return <></>;
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
