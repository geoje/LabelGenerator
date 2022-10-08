import {
  Grid,
  Group,
  Paper,
  Text,
  Center,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, MIME_TYPES, MS_EXCEL_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload, IconFileSpreadsheet, IconX } from "@tabler/icons";

function DataDropzone(props) {
  const theme = useMantineTheme();
  return (
    <Dropzone
      onDrop={onDrop}
      onReject={(file) => console.log("rejected files", file)}
      maxSize={3 * 1024 ** 2}
      accept={[...MS_EXCEL_MIME_TYPE, MIME_TYPES.csv]}
      {...props}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: 220, pointerEvents: "none" }}
      >
        <Dropzone.Accept>
          <IconUpload
            size={50}
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX
            size={50}
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileSpreadsheet size={50} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag data file here or click to select files
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Attach MS Excel or CSV file type, each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

function onDrop(file) {
  console.log("accepted files", file);
}

export default function Data() {
  return (
    <Grid m={0} p="sm">
      <Grid.Col sm={6} p="sm">
        <Paper shadow="xs" p="md" withBorder>
          <Group position="center">
            <DataDropzone />
          </Group>
        </Paper>
      </Grid.Col>
      <Grid.Col sm={6} p="sm">
        <Center>
          <Text size="xl" inline mt="xl">
            Here is QR zone
          </Text>
        </Center>
      </Grid.Col>
    </Grid>
  );
}
