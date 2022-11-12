import { Center, Grid, SegmentedControl, Text } from "@mantine/core";
import { IconFileHorizontal, IconLayoutBoardSplit } from "@tabler/icons";

export default function Calibrate() {
  const SegLabel = (icon, content) => (
    <Center>
      {icon}
      <Text ml={10}>{content}</Text>
    </Center>
  );

  return (
    <Grid m={0} p="sm" pt="lg">
      <Grid.Col md={2}>
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
          ]}
        />
      </Grid.Col>
      <Grid.Col md={10}></Grid.Col>
    </Grid>
  );
}
