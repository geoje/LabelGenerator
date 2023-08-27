import { Grid, Space, Stack } from "@mantine/core";
import {
  IconBarcode,
  IconCircle,
  IconPhoto,
  IconQrcode,
  IconQuestionMark,
  IconSquare,
  IconTypography,
} from "@tabler/icons-react";
import { LayoutSize } from "./components/draw/layoutSize";
import { Variable } from "./components/draw/variable";
import { Tool } from "./components/draw/tool";
import { Canvas } from "./components/draw/canvas";
import { Pagenation } from "./components/draw/pagenation";
import { Detail } from "./components/draw/detail";
import { Layer } from "./components/draw/layer";
import { TYPE } from "./lib/drawSlice";

export function typeToIcon(type: any) {
  return type === TYPE.rect ? (
    <IconSquare />
  ) : type === TYPE.circle ? (
    <IconCircle />
  ) : type === TYPE.text ? (
    <IconTypography />
  ) : type === TYPE.image ? (
    <IconPhoto />
  ) : type === TYPE.bar ? (
    <IconBarcode />
  ) : type === TYPE.qr ? (
    <IconQrcode />
  ) : (
    <IconQuestionMark />
  );
}

export default function Draw() {
  return (
    <Grid m={0} p="sm">
      <Grid.Col md={2} p="sm">
        <LayoutSize />
        <Space h={96} />
        <Variable />
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
        <Layer />
      </Grid.Col>
    </Grid>
  );
}
