import {
  Grid,
  Group,
  Paper,
  Text,
  useMantineTheme,
  Button,
  MultiSelect,
  Table,
  ScrollArea,
  Box,
  CloseButton,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconUpload, IconFileSpreadsheet, IconX } from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { set as setData } from "./dataSlice";
import { set as setQRFormat } from "./qrFormatSlice";
const MAX_FILE_SIZE = 5 * 1024 ** 2;

function StringReplaceAt(str, index, replacement) {
  return (
    str.substring(0, index) +
    replacement +
    str.substring(index + replacement.length)
  );
}

function DataTable() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const keys = [];
  for (let key of Object.keys(data[0])) keys.push(key);

  return (
    <Table fontSize="xs" highlightOnHover style={{ whiteSpace: "nowrap" }}>
      <thead>
        <tr>
          {keys.map((key) => (
            <th key={"th" + key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((e, i) => (
          <tr key={"tr" + i}>
            {keys.map((key) => (
              <td key={"td" + i + key}>{e[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
function FormatMultiSelect() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);

  const GRP_DATA = "Data Header";
  const GRP_CUST = "Custom Created";
  const [custom, setCustom] = useState([
    { value: Math.random().toString(), label: "|", group: GRP_CUST },
    { value: Math.random().toString(), label: ",", group: GRP_CUST },
  ]);

  return (
    <MultiSelect
      label="(2) QR Code Data Format"
      data={Object.keys(data ? data[0] : {})
        .map((v) => {
          return { value: v, label: v, group: GRP_DATA };
        })
        .concat(custom)}
      placeholder="Sesetlect items or create customization with an input"
      searchable
      creatable
      clearable
      mt="md"
      maxDropdownHeight={400}
      transitionDuration={100}
      transition="pop-top-left"
      transitionTimingFunction="ease"
      valueComponent={({
        value,
        label,
        group,
        onRemove,
        classNames,
        ...others
      }) => {
        return (
          <div {...others}>
            <Box
              sx={(theme) => ({
                display: "flex",
                cursor: "default",
                alignItems: "center",
                color:
                  group === GRP_DATA
                    ? theme.colorScheme === "dark"
                      ? theme.colors.blue[6]
                      : theme.colors.blue[8]
                    : theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.gray[7],
                backgroundColor:
                  group === GRP_DATA
                    ? theme.colorScheme === "dark"
                      ? theme.white
                      : theme.colors.blue[0]
                    : theme.colorScheme === "dark"
                    ? theme.colors.dark[7]
                    : theme.colors.gray[1],
                paddingLeft: 10,
                borderRadius: 4,
              })}
            >
              <Box sx={{ lineHeight: 1, fontSize: 12 }}>{label}</Box>
              <CloseButton
                onMouseDown={onRemove}
                variant="transparent"
                size={22}
                iconSize={14}
                tabIndex={-1}
                sx={(theme) => ({
                  color:
                    group === GRP_DATA
                      ? theme.colorScheme === "dark"
                        ? theme.colors.blue[6]
                        : theme.colors.blue[8]
                      : theme.colorScheme === "dark"
                      ? theme.colors.dark[0]
                      : theme.colors.gray[7],
                })}
              />
            </Box>
          </div>
        );
      }}
      getCreateLabel={(query) => `+ Create ${query}`}
      onCreate={(query) => {
        const item = {
          value: Math.random().toString(),
          label: query,
          group: GRP_CUST,
        };
        setCustom((current) => [...current, item]);
        return item;
      }}
      onChange={(value) =>
        dispatch(
          setQRFormat(
            value.map((v) => {
              const literal = custom.find((c) => c.value === v);
              return {
                value: literal ? literal.label : v,
                literal: literal !== undefined,
              };
            })
          )
        )
      }
    />
  );
}
function QRCodePaper() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const qrFormat = useSelector((state) => state.qrFormat.value);
  console.log(qrFormat);

  return (
    <>
      <Text color="gray.9" weight="500" size={14} mb={1}>
        (3) QR Code Result
      </Text>
      <Paper shadow="xs" p="md" withBorder></Paper>
    </>
  );
}

export default function Import() {
  // Provider
  const dispatch = useDispatch();
  const data = useSelector((state) => state.data.value);

  const theme = useMantineTheme();
  const [workbook, setWorkbook] = useState(null);

  /** Raw Excel data to Array
   * {'A1': 'id', 'A2': 'abc', 'B1': 'pw', 'B2': '123', ...} to
   * [ {'id': 'abc', 'pw': '123'}, ...]
   */
  const refineData = (rawData) => {
    const range = {
      row: [...rawData["!ref"].matchAll(/\d+/g)].map((r) => Number(r[0])),
      col: [...rawData["!ref"].matchAll(/[a-zA-Z]+/g)].map((r) => r[0]),
    };
    let refinedData = Array(range.row[1] - range.row[0] + 1).fill({});

    /** Excel header string increasement
     * A > B > ... > Z > AA > AB > ... > AZ > BA > BB > ... > ZZ > AAA > ...
     */
    const IncreaseAlpha = (a, i) =>
      a.charAt(i) === "Z"
        ? i
          ? IncreaseAlpha(StringReplaceAt(a, i, "A"), i - 1)
          : "A" + StringReplaceAt(a, i, "A")
        : StringReplaceAt(a, i, String.fromCharCode(a.charCodeAt(i) + 1));

    // Convert rawData to write refinedData
    for (
      let x = range.col[0];
      x !== range.col[1];
      x = IncreaseAlpha(x, x.length - 1)
    )
      for (
        let i = 0,
          y = range.row[0] + 1,
          h = rawData[x + range.row[0]].v.toString();
        y <= range.row[1];
        i++, y++
      )
        refinedData[i][h] = rawData[x + y]?.v || "";

    dispatch(setData(refinedData));
  };

  // File Reader
  let reader = new FileReader();
  reader.onload = (event) => {
    var wb = XLSX.read(event.target.result, { type: "binary" });

    // More than 2 sheets
    if (wb.SheetNames.length >= 2) setWorkbook(wb);
    // Single sheet
    else if (wb.SheetNames.length === 1) {
      refineData(wb.Sheets[wb.SheetNames[0]]);
    }
    // No sheets
    else {
      showNotification({
        title: "No sheet in file",
        message: "The file must have more than 1 sheet",
        color: "red",
      });
      return;
    }
  };

  return (
    <Grid m={0} p="sm">
      <Grid.Col sm={8} p="sm">
        <Text color="gray.9" weight="500" size={14} mb={1}>
          (1) Import Data
        </Text>
        <Paper shadow="xs" p="md" withBorder>
          {data ? (
            <ScrollArea style={{ height: 760 }}>
              <DataTable />
            </ScrollArea>
          ) : (
            <>
              <Group position="center">
                <Dropzone
                  onDrop={(files) => {
                    // More than 2 files are rejected
                    if (files.length >= 2) {
                      showNotification({
                        title: "Not single file",
                        message: "You must upload just single file",
                        color: "red",
                      });
                      return;
                    }

                    reader.readAsBinaryString(files[0]);
                  }}
                  onReject={(files) => {
                    let noti = {};

                    // More than 2 files are rejected
                    if (files.length >= 2)
                      noti = {
                        title: "Not single file",
                        message: "You must upload just single file",
                      };
                    else if (
                      files[0].errors.some(
                        (e) => e.code === "file-invalid-type"
                      )
                    )
                      noti = {
                        title: "Unsupported file type",
                        message: "File type must be one of (xlsx, xls, csv)",
                      };
                    else if (
                      files[0].errors.some((e) => e.code === "file-too-large")
                    )
                      noti = {
                        title: "Too large file",
                        message: "File size exceed 5mb",
                      };

                    // Error notification
                    showNotification({ ...noti, color: "red" });
                  }}
                  maxSize={MAX_FILE_SIZE}
                  accept={[MIME_TYPES.xlsx, MIME_TYPES.xls, MIME_TYPES.csv]}
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
                        color={
                          theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
                        }
                      />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconFileSpreadsheet size={50} stroke={1.5} />
                    </Dropzone.Idle>

                    <div>
                      <Text size="xl" inline>
                        Drag data file here or click to select file
                      </Text>
                      <Text size="sm" color="dimmed" inline mt={7}>
                        Attach MS Excel or CSV file, file should not exceed 5mb
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              </Group>
              {workbook && (
                <>
                  <Text align="center" size="xl" mt="sm">
                    Choose 1 sheet
                  </Text>
                  <Group position="center" mt="xs">
                    {workbook.SheetNames.map((name) => (
                      <Button
                        key={name}
                        size="xs"
                        radius="xl"
                        onClick={() => {
                          refineData(workbook.Sheets[name]);
                          setWorkbook(null);
                        }}
                      >
                        {name}
                      </Button>
                    ))}
                  </Group>
                </>
              )}
            </>
          )}
        </Paper>
      </Grid.Col>
      <Grid.Col sm={4} p="sm">
        <QRCodePaper />
        <FormatMultiSelect />
      </Grid.Col>
    </Grid>
  );
}
