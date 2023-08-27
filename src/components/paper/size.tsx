import {
  Grid,
  Group,
  NumberInput,
  SegmentedControl,
  Select,
  Text,
} from "@mantine/core";
import {
  IconFile,
  IconFileHorizontal,
  IconLayoutBoardSplit,
  IconRuler3,
} from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import {
  UNIT,
  PAPER_TYPE,
  DEFAULT_PAPER_SIZE,
  convertSize,
  setLayout,
  MAX_PRECISION,
  STEP_BY_UNIT,
} from "../../lib/paperSlice";
import { DETAIL_ICON_SIZE } from "../../lib/drawSlice";
import { useIntl } from "react-intl";

export function Size() {
  const dispatch = useDispatch();
  const drawLayout = useSelector((state: any) => state.draw.layout);
  const paperLayout = useSelector((state: any) => state.paper.layout);
  const intl = useIntl();

  const SegLabel = (icon: any, content: any) => (
    <Group noWrap>
      {icon}
      <Text>{content}</Text>
    </Group>
  );
  const isSameSize = (size1: any, size2: any) =>
    Math.abs(convertSize(size1, size2.unit).w - size2.w) +
      Math.abs(convertSize(size1, size2.unit).h - size2.h) <
    0.01;

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
              label: SegLabel(
                <IconFileHorizontal />,
                intl.formatMessage({ id: "Fit content" })
              ),
            },
            {
              value: PAPER_TYPE.letter,
              label: SegLabel(<IconFile />, "Letter"),
            },
            {
              value: PAPER_TYPE.a4,
              label: SegLabel(<IconFile />, "A4"),
            },
            {
              value: PAPER_TYPE.custom,
              label: SegLabel(
                <IconLayoutBoardSplit />,
                intl.formatMessage({ id: "Custom" })
              ),
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
                      l: 0,
                      t: 0,
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
          precision={MAX_PRECISION}
          step={STEP_BY_UNIT[paperLayout.unit]}
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
          precision={MAX_PRECISION}
          step={STEP_BY_UNIT[paperLayout.unit]}
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
