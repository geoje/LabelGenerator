import {
  Group,
  ActionIcon,
  Divider,
  Tooltip,
  FileButton,
  Button,
  Title,
  Text,
} from "@mantine/core";
import { IconFile, IconInfoCircle } from "@tabler/icons-react";
import {
  TYPE,
  GROUP_VAR,
  convertSize,
  typeToIcon,
  addLayer,
  setLayer,
} from "@/lib/drawSlice";
import { MAX_FILE_SIZE } from "@/lib/dataSlice";
import { UNIT } from "@/lib/paperSlice";
import React from "react";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export function Tool() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.data.value);
  const layout = useSelector((state: any) => state.draw.layout);
  const layoutPx = convertSize(layout, UNIT.px);
  const layer = useSelector((state: any) => state.draw.layer);
  const page = useSelector((state: any) => state.draw.page);

  let [layerCount, setLayerCount] = useState(1);
  const [openedInfo, setOpenedInfo] = useState(false);

  const prediectLayerName = (o: any) => o.name === "layer" + layerCount;
  const getNextLayerName = () => {
    while (layer.some(prediectLayerName)) layerCount++;
    setLayerCount(layerCount + 1);
    return "layer" + layerCount;
  };

  return (
    <Group position="center" spacing="xs">
      <Tooltip label="New canvas" withArrow>
        <ActionIcon variant="subtle" onClick={() => dispatch(setLayer([]))}>
          <IconFile />
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Rectangle" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.rect,
                size: {
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                  h: 20,
                },
                border: {
                  style: "solid",
                  width: 1,
                  color: { value: "#000000" },
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.rect)}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Circle" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.circle,
                size: {
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                  h: 20,
                },
                border: {
                  style: "solid",
                  width: 1,
                  color: { value: "#000000" },
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.circle)}
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip label="Text" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() => {
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.text,
                size: {
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                },
                font: {
                  size: 10,
                  weight: 400,
                  color: { value: "#000000" },
                },
                var: [
                  {
                    value: Math.random(),
                    label: "New Text",
                    group: GROUP_VAR.CONST,
                  },
                ],
              })
            );
          }}
        >
          {typeToIcon(TYPE.text)}
        </ActionIcon>
      </Tooltip>
      <FileButton
        accept="image/*"
        onChange={(file) => {
          // Empty
          if (!file) return;

          // No image type
          if (!file.type.startsWith("image/")) {
            showNotification({
              title: "Unsupported file type",
              message: "File type must be one of (png, jpg, svg, ...)",
              color: "red",
            });
            return;
          }

          // Exceed file size
          if (file.size > MAX_FILE_SIZE) {
            showNotification({
              title: "Too large file",
              message: "File size exceed 5mb",
              color: "red",
            });
            return;
          }

          const url = URL.createObjectURL(file);
          const img = new Image();
          img.onload = () => {
            const wRatio = layoutPx.w / img.width;
            const hRatio = layoutPx.h / img.height;
            const w = Math.floor(Math.min(wRatio, hRatio) * img.width);
            const h = Math.floor(Math.min(wRatio, hRatio) * img.height);

            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.image,
                size: {
                  x: layoutPx.w / 2 - w / 2,
                  y: layoutPx.h / 2 - h / 2,
                  w,
                  h,
                  nw: w,
                  nh: h,
                },
                var: { default: url },
              })
            );
          };
          img.src = url;
        }}
      >
        {(props) => (
          <Tooltip label="Image" withArrow>
            <Button
              p={0}
              color="gray"
              variant="subtle"
              leftIcon={typeToIcon(TYPE.image)}
              styles={() => ({
                root: { width: 28, height: 28 },
                leftIcon: { marginRight: 0 },
              })}
              {...props}
            />
          </Tooltip>
        )}
      </FileButton>
      <Tooltip label="Bar code" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.bar,
                size: {
                  x: layoutPx.w / 2 - 20,
                  y: layoutPx.h / 2 - 10,
                  h: 20,
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.bar)}
        </ActionIcon>
      </Tooltip>
      <Tooltip label="QR code" withArrow>
        <ActionIcon
          variant="subtle"
          onClick={() =>
            dispatch(
              addLayer({
                name: getNextLayerName(),
                type: TYPE.qr,
                size: {
                  x: layoutPx.w / 2 - 10,
                  y: layoutPx.h / 2 - 10,
                  w: 20,
                },
              })
            )
          }
        >
          {typeToIcon(TYPE.qr)}
        </ActionIcon>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip
        styles={(theme) => {
          return {
            tooltip: {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? "rgba(37, 38, 43, 0.8)"
                  : "rgba(33, 37, 41, 0.8)",
            },
          };
        }}
        position="right"
        withArrow
        multiline
        opened={openedInfo}
        label={
          <>
            <Title order={5} align="center">
              # {page}
            </Title>
            <Divider my={4} />
            {data[page] &&
              Object.entries(data[page]).map(([k, v]: any, j) => (
                <Group key={`tooltip-${page}-${j}`} spacing="xs">
                  <Title order={6}>{k}</Title>
                  <Text size="xs">{v}</Text>
                </Group>
              ))}
          </>
        }
      >
        <ActionIcon variant="subtle" onClick={() => setOpenedInfo((b) => !b)}>
          <IconInfoCircle />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
