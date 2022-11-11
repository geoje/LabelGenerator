import {
  Grid,
  Group,
  NumberInput,
  Stack,
  ActionIcon,
  Select,
  Divider,
  Title,
  Slider,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconRuler3 } from "@tabler/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UNIT,
  DETAIL_ICON_SIZE,
  convertLayout,
  setLayout,
  setLayoutRatio,
  setPage,
} from "./drawSlice";
import { Variable } from "./variable";
import { Tool } from "./tool";
import { Canvas } from "./canvas";
import { Detail } from "./detail";
import { Layer } from "./layer";

// Left
function LayoutSize() {
  // Provider
  const dispatch = useDispatch();
  const layout = useSelector((state) => state.draw.layout);

  return (
    <Grid>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={layout.w}
          size="xs"
          precision={layout.unit === "px" ? 0 : 2}
          step={layout.unit === "px" ? 1 : 0.1}
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
          precision={layout.unit === "px" ? 0 : 2}
          step={layout.unit === "px" ? 1 : 0.1}
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
            dispatch(setLayout(convertLayout[value](layout)));
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

// Middle
export function Pagenation() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const page = useSelector((state) => state.draw.page);

  return (
    <Group spacing={5} position="center">
      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() =>
          dispatch(setPage(Math.min(Math.max(0, page - 1), data.length - 1)))
        }
      >
        <IconChevronLeft />
      </ActionIcon>

      <NumberInput
        hideControls
        value={page}
        step={1}
        min={1}
        max={data.length}
        disabled={!data.length}
        styles={{ input: { width: 54, height: 36, textAlign: "center" } }}
        onChange={(val) =>
          dispatch(
            setPage(val ? Math.min(Math.max(0, val), data.length - 1) : 0)
          )
        }
        onWheel={(event) => {
          const val = Math.min(
            Math.max(0, page - Math.sign(event.deltaY)),
            data.length - 1
          );
          if (page === val) return;

          dispatch(setPage(val));
          event.target.blur();
        }}
      />

      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() =>
          dispatch(setPage(Math.min(Math.max(0, page + 1), data.length - 1)))
        }
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}

export default function Design() {
  return (
    <Grid m={0} p="sm">
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layout Size
          </Title>
          <Divider my="sm" />
          <LayoutSize />
        </Stack>
        <Stack spacing={0} mt={48}>
          <Variable />
        </Stack>
      </Grid.Col>
      <Grid.Col md={8} p="sm">
        <Stack align="center" spacing="xs">
          <Tool />
          <Canvas />
          <Pagenation />
          <Detail />
        </Stack>
      </Grid.Col>
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layer
          </Title>
          <Divider my="sm" />
          <Layer />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
