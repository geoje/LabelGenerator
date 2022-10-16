import {
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  ActionIcon,
  Select,
  Divider,
  Title,
  Slider,
} from "@mantine/core";
import React, { useRef } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconDeviceFloppy,
  IconFolder,
  IconQrcode,
  IconSquare,
  IconTypography,
  IconVariable,
} from "@tabler/icons";
import { setSize, setSizeRatio } from "./drawSlice";

const UNITS = ["inch", "cm", "px"];
const convertSize = {
  inch: (size) => {
    if (size.unit === "cm")
      return {
        w: size.w / 2.54,
        h: size.h / 2.54,
        unit: "inch",
        ratio: size.ratio,
      };
    else if (size.unit === "px")
      return {
        w: size.w / 96,
        h: size.h / 96,
        unit: "inch",
        ratio: size.ratio,
      };
    else return size;
  },
  cm: (size) => {
    if (size.unit === "inch")
      return {
        w: size.w * 2.54,
        h: size.h * 2.54,
        unit: "cm",
        ratio: size.ratio,
      };
    else if (size.unit === "px")
      return {
        w: (size.w / 96) * 2.54,
        h: (size.h / 96) * 2.54,
        unit: "cm",
        ratio: size.ratio,
      };
    else return size;
  },
  px: (size) => {
    if (size.unit === "inch")
      return {
        w: Math.round(size.w * 96),
        h: Math.round(size.h * 96),
        unit: "px",
        ratio: size.ratio,
      };
    else if (size.unit === "cm")
      return {
        w: Math.round((size.w / 2.54) * 96),
        h: Math.round((size.h / 2.54) * 96),
        unit: "px",
        ratio: size.ratio,
      };
    else return size;
  },
};

/** Left
 *
 * @returns
 */
function LayoutSize() {
  // Provider
  const dispatch = useDispatch();
  const size = useSelector((state) => state.draw.size);

  return (
    <Grid mb={0}>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={size.w}
          size="xs"
          precision={size.unit === "px" ? 0 : 2}
          step={size.unit === "px" ? 1 : 0.1}
          onChange={(value) =>
            dispatch(
              setSize({
                ...size,
                w: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={6} xl={4}>
        <NumberInput
          value={size.h}
          size="xs"
          precision={size.unit === "px" ? 0 : 2}
          step={size.unit === "px" ? 1 : 0.1}
          onChange={(value) =>
            dispatch(
              setSize({
                ...size,
                h: value,
              })
            )
          }
        />
      </Grid.Col>
      <Grid.Col span={4} md={12} xl={4}>
        <Select
          placeholder="Unit"
          size="xs"
          data={UNITS.map((s) => {
            return { value: s, label: s };
          })}
          value={size.unit}
          onChange={(value) => {
            if (value === size.unit) return;
            dispatch(setSize(convertSize[value](size)));
          }}
        />
      </Grid.Col>
      <Grid.Col>
        <Slider
          label={(val) => val * 100 + "%"}
          defaultValue={size.ratio}
          min={0.5}
          max={3}
          step={0.5}
          marks={[
            { value: 0.5 },
            { value: 1 },
            { value: 1.5 },
            { value: 2 },
            { value: 2.5 },
            { value: 3 },
          ]}
          styles={{ markLabel: { display: "none" } }}
          onChange={(value) => {
            dispatch(setSizeRatio(value));
          }}
        />
      </Grid.Col>
    </Grid>
  );
}
function Detail() {
  return <></>;
}

/** Middle
 *
 * @returns
 */
function Tool() {
  // Provider
  // const dispatch = useDispatch();
  const format = useSelector((state) => state.qr.format);

  return (
    <Group position="center" spacing="xs">
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconFolder />
      </ActionIcon>
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconDeviceFloppy />
      </ActionIcon>

      <Divider orientation="vertical" />
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconSquare />
      </ActionIcon>
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconCircle />
      </ActionIcon>
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconTypography />
      </ActionIcon>

      <Divider orientation="vertical" />
      <ActionIcon
        variant="subtle"
        onClick={() => {
          console.log(format);
        }}
      >
        <IconQrcode />
      </ActionIcon>
      <ActionIcon variant="subtle" onClick={() => {}}>
        <IconVariable />
      </ActionIcon>
    </Group>
  );
}
function FabricJSCanvas() {
  // Provider
  // const dispatch = useDispatch();
  const size = convertSize.px(useSelector((state) => state.draw.size));

  return (
    <Paper
      sx={{ width: size.w * size.ratio, height: size.h * size.ratio }}
      radius={0}
      shadow="xs"
      withBorder
    ></Paper>
  );
}
function Pagenation() {
  // Provider
  const data = useSelector((state) => state.data.value);

  const [index, setIndex] = useState(1);
  const handlers = useRef();

  return (
    <Group spacing={5} position="center">
      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() => handlers.current.decrement()}
      >
        <IconChevronLeft />
      </ActionIcon>

      <NumberInput
        hideControls
        value={index}
        onChange={(val) =>
          setIndex(
            Math.min(Math.max(Number.isNaN(val) ? 1 : val, 1), data.length)
          )
        }
        handlersRef={handlers}
        step={1}
        min={1}
        max={100}
        disabled={!data.length}
        styles={{ input: { width: 54, height: 36, textAlign: "center" } }}
      />

      <ActionIcon
        size={36}
        variant="filled"
        disabled={!data.length}
        onClick={() => handlers.current.increment()}
      >
        <IconChevronRight />
      </ActionIcon>
    </Group>
  );
}

/** Right
 *
 * @returns
 */
function Layer() {
  return <></>;
}
function Variable() {
  return <></>;
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
          <Title order={6} align="center">
            Detail
          </Title>
          <Divider my="sm" />
          <Detail />
        </Stack>
      </Grid.Col>
      <Grid.Col md={8} p="sm">
        <Stack align="center" spacing="xs">
          <Tool />
          <FabricJSCanvas />
          <Pagenation />
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
        <Stack spacing={0} mt={48}>
          <Title order={6} align="center">
            Variable
          </Title>
          <Divider my="sm" />
          <Variable />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
