import {
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  ActionIcon,
  Select,
  Divider,
  Button,
  Title,
} from "@mantine/core";
import { fabric } from "fabric";
import React, { useEffect, useRef } from "react";
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
import { setSize } from "./drawSlice";

const unitList = ["inch", "cm", "px"];
const convertSize = {
  inch: (size) => {
    if (size.unit === "cm")
      return { w: size.w / 2.54, h: size.h / 2.54, unit: "inch" };
    else if (size.unit === "px")
      return {
        w: size.w / 96,
        h: size.h / 96,
        unit: "inch",
      };
    else return size;
  },
  cm: (size) => {
    if (size.unit === "inch")
      return { w: size.w * 2.54, h: size.h * 2.54, unit: "cm" };
    else if (size.unit === "px")
      return {
        w: (size.w / 96) * 2.54,
        h: (size.h / 96) * 2.54,
        unit: "cm",
      };
    else return size;
  },
  px: (size) => {
    if (size.unit === "inch")
      return {
        w: Math.round(size.w * 96),
        h: Math.round(size.h * 96),
        unit: "px",
      };
    else if (size.unit === "cm")
      return {
        w: Math.round((size.w / 2.54) * 96),
        h: Math.round((size.h / 2.54) * 96),
        unit: "px",
      };
    else return size;
  },
};

function FabricJSCanvas() {
  // Provider
  // const dispatch = useDispatch();
  const size = useSelector((state) => state.draw.size);
  const pxSize = convertSize.px(size);

  const [canvas, setCavnas] = useState(null);

  useEffect(() => {
    if (document.querySelector("div.canvas-container")) return;

    setCavnas(
      new fabric.Canvas("canvas", {
        width: 359,
        height: 76,
        backgroundColor: "white",
      })
    );
  }, []);

  if (
    canvas &&
    (pxSize.w !== canvas.getWidth() || pxSize.h !== canvas.getHeight())
  ) {
    canvas.setWidth(pxSize.w);
    canvas.setHeight(pxSize.h);
  }
  return <canvas id="canvas" />;
}

export default function Design() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);
  const format = useSelector((state) => state.qr.format);
  const size = useSelector((state) => state.draw.size);

  const [index, setIndex] = useState(1);
  const handlers = useRef();
  const wInput = useRef();
  const hInput = useRef();

  return (
    <Grid m={0} p="sm">
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layout Size
          </Title>
          <Divider my="sm" />
          <Grid mb={0}>
            <Grid.Col span={6} xs={3} md={6}>
              <NumberInput
                ref={wInput}
                value={size.w}
                precision={2}
                step={0.01}
              />
            </Grid.Col>
            <Grid.Col span={6} xs={3} md={6}>
              <NumberInput
                ref={hInput}
                value={size.h}
                precision={2}
                step={0.01}
              />
            </Grid.Col>
            <Grid.Col span={6} xs={3} md={6}>
              <Select
                placeholder="Unit"
                data={unitList.map((s) => {
                  return { value: s, label: s };
                })}
                value={size.unit}
                onChange={(value) => {
                  if (value === size.unit) return;
                  dispatch(convertSize[value](size));
                }}
              />
            </Grid.Col>
            <Grid.Col span={6} xs={3} md={6}>
              <Button
                sx={{ width: "100%" }}
                onClick={() => {
                  dispatch(
                    setSize({
                      ...size,
                      w: Number(wInput.current.value),
                      h: Number(hInput.current.value),
                    })
                  );
                }}
              >
                Apply
              </Button>
            </Grid.Col>
          </Grid>
        </Stack>
        <Stack spacing={0} mt={48}>
          <Title order={6} align="center">
            Detail
          </Title>
          <Divider my="sm" />
        </Stack>
      </Grid.Col>
      <Grid.Col md={8} p="sm">
        <Stack>
          <Stack align="center" spacing="xs">
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
            <Paper radius={0} shadow="xs" withBorder>
              <FabricJSCanvas />
            </Paper>
          </Stack>
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
                  Math.min(
                    Math.max(Number.isNaN(val) ? 1 : val, 1),
                    data.length
                  )
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
        </Stack>
      </Grid.Col>
      <Grid.Col md={2} p="sm">
        <Stack spacing={0}>
          <Title order={6} align="center">
            Layer
          </Title>
          <Divider my="sm" />
        </Stack>
        <Stack spacing={0} mt={48}>
          <Title order={6} align="center">
            Variable
          </Title>
          <Divider my="sm" />
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
