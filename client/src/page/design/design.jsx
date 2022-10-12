import {
  Grid,
  Group,
  NumberInput,
  Paper,
  Stack,
  Text,
  ActionIcon,
  Select,
  Divider,
} from "@mantine/core";
import { fabric } from "fabric";
import React, { useEffect, useRef } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconQrcode,
  IconSquare,
  IconTypography,
  IconVariable,
} from "@tabler/icons";

function FabricJSCanvas(props) {
  const [, setCanvas] = useState("");

  useEffect(() => {
    setCanvas(initCanvas());
  }, []);
  const initCanvas = () =>
    new fabric.Canvas("canvas", {
      width: 359,
      height: 76,
      backgroundColor: "white",
    });
  return <canvas id="canvas" />;
}

export default function Design() {
  // Provider
  const data = useSelector((state) => state.data.value);
  // const format = useSelector((state) => state.qr.format);

  const [size, setSize] = useState({ w: 3.74, h: 0.79, unit: "inch" });
  const [tool, setTool] = useState("square");
  const [index, setIndex] = useState(1);
  const handlers = useRef();

  return (
    <Grid m={0} p="sm">
      <Grid.Col md={2} p="sm">
        <Text weight="500" align="center" size={14} mb={1}>
          Detail
        </Text>
        <Divider my="sm" />
      </Grid.Col>
      <Grid.Col md={8} p="sm">
        <Stack>
          <Group position="center">
            <Text weight="500" size={14}>
              Size
            </Text>
            <NumberInput
              sx={{ width: 80 }}
              value={size.w}
              precision={2}
              step={0.01}
              onChange={(val) => setSize({ ...size, w: val })}
            />
            <NumberInput
              sx={{ width: 80 }}
              value={size.h}
              precision={2}
              step={0.01}
              onChange={(val) => setSize({ ...size, h: val })}
            />
            <Select
              sx={{ width: 80 }}
              placeholder="Unit"
              data={[
                { value: "inch", label: "inch" },
                { value: "cm", label: "cm" },
              ]}
              value={size.unit}
              onChange={(value) => {
                if (value === size.unit) return;

                setSize(
                  value === "inch"
                    ? { w: size.w * 2.54, h: size.h * 2.54, unit: value }
                    : value === "cm"
                    ? { w: size.w / 2.54, h: size.h / 2.54, unit: value }
                    : size
                );
              }}
            />
          </Group>

          <Stack align="center" spacing="xs">
            <Group position="center" spacing="xs">
              <ActionIcon
                variant={tool === "square" ? "" : "subtle"}
                onClick={() => setTool("square")}
              >
                <IconSquare />
              </ActionIcon>
              <ActionIcon
                variant={tool === "circle" ? "" : "subtle"}
                onClick={() => setTool("circle")}
              >
                <IconCircle />
              </ActionIcon>
              <ActionIcon
                variant={tool === "typography" ? "" : "subtle"}
                onClick={() => setTool("typography")}
              >
                <IconTypography />
              </ActionIcon>
              <ActionIcon
                variant={tool === "qrcode" ? "" : "subtle"}
                onClick={() => setTool("qrcode")}
                ml="md"
              >
                <IconQrcode />
              </ActionIcon>
              <ActionIcon
                variant={tool === "variable" ? "" : "subtle"}
                onClick={() => setTool("variable")}
              >
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
              <IconChevronRight
                w={
                  size.unit === "inch"
                    ? size.w * 96
                    : size.unit === "cm"
                    ? size.w * 37.795275591
                    : size.w
                }
                h={
                  size.unit === "inch"
                    ? size.h * 96
                    : size.unit === "cm"
                    ? size.h * 37.795275591
                    : size.h
                }
              />
            </ActionIcon>
          </Group>
        </Stack>
      </Grid.Col>
      <Grid.Col md={2} p="sm">
        <Text align="center" weight="500" size={14} mb={1}>
          Layer
        </Text>
        <Divider my="sm" />
      </Grid.Col>
    </Grid>
  );
}
