import {
  convertSize,
  DETAIL_ICON_SIZE,
  setLayout,
  setLayoutRatio,
} from "@/lib/drawSlice";
import { MAX_PRECISION, STEP_BY_UNIT, UNIT } from "@/lib/paperSlice";
import { Grid, Group, NumberInput, Select, Slider, Title } from "@mantine/core";
import { IconDimensions, IconRuler3 } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";

export function LayoutSize() {
  const dispatch = useDispatch();
  const layout = useSelector((state: any) => state.draw.layout);

  const { t } = useTranslation();

  return (
    <Grid>
      <Grid.Col>
        <Group position="center">
          <IconDimensions />
          <Title order={5}>{t("Layout size")}</Title>
        </Group>
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={layout.w}
          size="xs"
          precision={MAX_PRECISION}
          step={STEP_BY_UNIT[layout.unit]}
          onChange={(value) =>
            dispatch(
              setLayout({
                ...layout,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={layout.h}
          size="xs"
          precision={MAX_PRECISION}
          step={STEP_BY_UNIT[layout.unit]}
          onChange={(value) =>
            dispatch(
              setLayout({
                ...layout,
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
          value={layout.unit}
          onChange={(value) => {
            if (value === layout.unit) return;
            dispatch(setLayout(convertSize(layout, value)));
          }}
        />
      </Grid.Col>
      <Grid.Col>
        <Slider
          label={(val) => (1 + val) * 100 + "%"}
          defaultValue={0}
          value={layout.ratio - 1}
          min={0}
          max={2}
          step={0.5}
          marks={[
            { value: 0 },
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
          ]}
          styles={{ markLabel: { display: "none" } }}
          onChange={(value) => {
            dispatch(setLayoutRatio(1 + value));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}
