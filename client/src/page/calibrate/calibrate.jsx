import { Grid, Group, SegmentedControl, Stack, Text } from "@mantine/core";
import { IconFileHorizontal, IconLayoutBoardSplit } from "@tabler/icons";

export default function Calibrate() {
  const SegLabel = (icon, content) => (
    <Group noWrap>
      {icon}
      <Text>{content}</Text>
    </Group>
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
            {
              value: "custom",
              label: SegLabel(<IconLayoutBoardSplit />, "Custom"),
            },
          ]}
        />
      </Grid.Col>
      <Grid.Col md={10}>
        <Stack align="center">
          <Text size={48}>Just pass this section.</Text>
          <Text size={48}>Here will be developed later.</Text>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}
