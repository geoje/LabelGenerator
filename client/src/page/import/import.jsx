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
  Stack,
  Divider,
  ActionIcon,
  Title,
  Popover,
  JsonInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import {
  IconUpload,
  IconFileSpreadsheet,
  IconX,
  IconForms,
  IconSquareNumber3,
  IconDeviceFloppy,
  IconSquareNumber2,
  IconSquareNumber1,
  IconTrash,
  IconClipboard,
} from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { QRCodeSVG } from "qrcode.react";
import * as XLSX from "xlsx";
import { set as setData } from "./dataSlice";
import { setFormat, setCustom, setSelected } from "./qrSlice";
import { Pagenation } from "../design/design";
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
  if (data.length) for (let key of Object.keys(data[0])) keys.push(key);

  return (
    <Table
      fontSize="xs"
      striped
      highlightOnHover
      style={{ whiteSpace: "nowrap" }}
    >
      <thead>
        <tr>
          {keys.map((key) => (
            <th key={"th" + key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((v, i) => (
          <tr key={"tr" + i}>
            {keys.map((key) => (
              <td key={"td" + i + key}>{v[key]}</td>
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
  let custom = useSelector((state) => state.qr.custom);
  const selected = useSelector((state) => state.qr.selected);
  const format = useSelector((state) => state.qr.format);

  const importHook = useDisclosure(false);
  const openedImportFormat = importHook[0],
    closeImportFormat = importHook[1].close,
    toggleImportFormat = importHook[1].toggle;
  const [textImportFormat, setTextImportFormat] = useState("");
  const [errorImportFormat, setErrorImportFormat] = useState("");

  const GRP_DATA = "Data Header";
  const GRP_CUST = "Custom Created";

  const valueComponent = ({
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
                  ? theme.colors.blue[1]
                  : theme.colors.blue[8]
                : theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
            backgroundColor:
              group === GRP_DATA
                ? theme.colorScheme === "dark"
                  ? "rgba(24, 100, 171, 0.45)"
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
                    ? theme.colors.blue[1]
                    : theme.colors.blue[8]
                  : theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.colors.gray[7],
            })}
          />
        </Box>
      </div>
    );
  };
  const importFormat = (text) => {
    if (text === "") {
      setErrorImportFormat("Empty text");
      return;
    }

    try {
      let keys = [];
      if (data.length) for (let key of Object.keys(data[0])) keys.push(key);
      setCustom([]);
      setSelected([]);

      let errorValue = "";
      let tempCustom = [];
      let tempSelected = [];

      // set custom and selected from imported format text
      const formatJson = JSON.parse(text);
      formatJson.forEach((e) => {
        if (e.literal) {
          const mathValue = Math.random().toString();
          tempCustom.push({
            value: mathValue,
            label: e.value,
            group: GRP_CUST,
          });
          tempSelected.push(mathValue);
        } else {
          if (!keys.includes(e.value)) {
            errorValue = e.value;
            return;
          }
          tempSelected.push(e.value);
        }
      });
      if (errorValue.length) {
        setErrorImportFormat(`No value '${errorValue} in data'`);
        return;
      }

      // Add selectable unique custom
      tempCustom
        .filter((v, i, s) => s.findIndex((e) => e.label === v.label) === i)
        .map((e) => {
          return { ...e, value: Math.random().toString() };
        })
        .forEach((e) => tempCustom.push(e));

      // Apply custom and selected
      dispatch(setCustom(tempCustom));
      dispatch(setSelected(tempSelected));

      // Set format
      dispatch(setFormat(formatJson));

      closeImportFormat();
      showNotification({
        title: "Imported Successfully",
        message: `${formatJson.length} item${
          formatJson.length === 1 ? "" : "s"
        } imported`,
        color: "green",
      });
    } catch (err) {
      setErrorImportFormat("Import Error");
      console.error(err);
    }
  };

  return (
    <>
      <Group
        spacing={0}
        sx={(theme) => ({
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[0]
              : theme.colors.gray[8],
        })}
      >
        <IconSquareNumber2 />
        <Title order={6} mr="sm">
          QR Code Content Format
        </Title>

        <Popover
          width={300}
          trapFocus
          position="bottom"
          withArrow
          shadow="md"
          opened={openedImportFormat}
        >
          <Popover.Target>
            <ActionIcon variant="subtle" onClick={() => toggleImportFormat()}>
              <IconForms />
            </ActionIcon>
          </Popover.Target>
          <Popover.Dropdown
            sx={(theme) => ({
              background:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[7]
                  : theme.white,
            })}
          >
            <JsonInput
              label="Import format from text"
              placeholder="Enter the variable text"
              validationError="Invalid json"
              error={errorImportFormat}
              size="xs"
              minRows={4}
              onChange={(value) => {
                setErrorImportFormat(null);
                setTextImportFormat(value);
              }}
            />
            <Group mt="xs">
              <Button size="xs" onClick={() => importFormat(textImportFormat)}>
                Submit
              </Button>
              <Button
                ml="auto"
                variant="subtle"
                size="xs"
                onClick={() => closeImportFormat()}
              >
                Close
              </Button>
            </Group>
          </Popover.Dropdown>
        </Popover>

        <ActionIcon
          variant="subtle"
          onClick={() => {
            const jsonText = JSON.stringify(format);
            navigator.clipboard.writeText(jsonText);
            showNotification({
              title: "Copied Successfully",
              message: `${format.length} item${
                format.length === 1 ? "" : "s"
              } copied`,
              color: "green",
            });
          }}
        >
          <IconClipboard />
        </ActionIcon>
      </Group>
      <MultiSelect
        placeholder="Select items or create customization with an input"
        searchable
        creatable
        clearable
        maxDropdownHeight={400}
        transitionDuration={100}
        transition="pop-top-left"
        transitionTimingFunction="ease"
        data={Object.keys(data.length ? data[0] : {})
          .map((v) => {
            return { value: v, label: v, group: GRP_DATA };
          })
          .concat(custom)}
        value={selected}
        valueComponent={valueComponent}
        getCreateLabel={(query) => `+ Create ${query}`}
        onCreate={(query) => {
          const item = {
            value: Math.random().toString(),
            label: query,
            group: GRP_CUST,
          };

          dispatch(setCustom((custom = [...custom, item])));
          return item;
        }}
        onChange={(value) => {
          dispatch(setSelected([...value]));
          dispatch(
            setFormat(
              value.map((v) => {
                const literal = custom.find((c) => c.value === v);
                return {
                  value: literal ? literal.label : v,
                  literal: literal !== undefined,
                };
              })
            )
          );

          /* Keep just one default seperator '|' and ',' */
          // Remove duplicated in unused
          let newCustom = custom.filter((o) => value.includes(o.value));
          let uniqueUnusedCustom = custom
            .filter((o) => !value.includes(o.value))
            .filter(
              (o1, i, a) => a.findIndex((o2) => o2.label === o1.label) === i
            );

          // Add used label
          const GRP_CUST = "Custom Created";
          newCustom = newCustom
            .map((o) => o.label)
            .filter((v, i, a) => a.indexOf(v) === i)
            .filter((v) => !uniqueUnusedCustom.some((o) => o.label === v))
            .map((v) => {
              return {
                value: Math.random().toString(),
                label: v,
                group: GRP_CUST,
              };
            }) // Used label exclude uniqueUnusedCustom
            .concat(uniqueUnusedCustom)
            .concat(newCustom);

          dispatch(setCustom(newCustom));
        }}
        onPaste={(event) => {
          importFormat(
            (event.clipboardData || window.clipboardData).getData("text")
          );
          event.preventDefault();
        }}
      />
    </>
  );
}
function QRCodePaper() {
  // Provider
  const data = useSelector((state) => state.data.value);
  const format = useSelector((state) => state.qr.format);
  const page = useSelector((state) => state.draw.page);

  const keys = data.length ? Object.keys(data[0]) : [];
  const content = format
    .filter((o) => o.literal || keys.includes(o.value))
    .map((o) => (o.literal ? o.value : data[page][o.value]))
    .join("");

  return (
    <>
      <Group
        spacing={0}
        sx={(theme) => ({
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[0]
              : theme.colors.gray[8],
        })}
      >
        <IconSquareNumber3 />
        <Title order={6} mr="sm">
          QR Code Result
        </Title>

        <ActionIcon
          variant="subtle"
          onClick={() =>
            showNotification({
              title: "Sorry",
              message: "This function is developing now...",
              color: "yellow",
            })
          }
        >
          <IconClipboard />
        </ActionIcon>
      </Group>
      <Paper shadow="xs" p="md" withBorder>
        <Stack align="center" spacing={0}>
          <Paper
            p="xs"
            style={{
              height: "100px",
              boxSizing: "content-box",
              backgroundColor: "#fff",
            }}
          >
            <QRCodeSVG value={content} size={100} />
          </Paper>

          <Text size="xs" align="center">
            {content}
          </Text>
        </Stack>
        <Divider my="sm" />
        <Pagenation />
      </Paper>
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
    // No data reference found
    if (!rawData["!ref"]) {
      showNotification({
        title: "No data reference found",
        message: "Cannot load data reference in file",
        color: "red",
      });
      return;
    }

    const range = {
      row: [...rawData["!ref"].matchAll(/\d+/g)].map((r) => Number(r[0])),
      col: [...rawData["!ref"].matchAll(/[a-zA-Z]+/g)].map((r) => r[0]),
    };
    // No data range found
    if (range.row.length < 2 || range.col.length < 2) {
      showNotification({
        title: "No data range found",
        message: "Cannot load data range in file",
        color: "red",
      });
      return;
    }

    let refinedData = [];
    for (let i = range.row[0] + 1; i <= range.row[1]; i++) refinedData.push({});

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
        <Group
          spacing={0}
          sx={(theme) => ({
            color:
              theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[8],
          })}
        >
          <IconSquareNumber1 />
          <Title order={6} mr="sm">
            Import Data
          </Title>

          <ActionIcon
            variant="subtle"
            onClick={() => {
              if (data.length) {
                dispatch(setData([]));
                setWorkbook(null);

                showNotification({
                  title: "Deleted",
                  message: "Data deleted successfully",
                  color: "green",
                });
              } else if (workbook) {
                setWorkbook(null);

                showNotification({
                  title: "Deleted",
                  message: "Workbook deleted successfully",
                  color: "green",
                });
              }
            }}
          >
            <IconTrash />
          </ActionIcon>
        </Group>
        <Paper shadow="xs" p="md" withBorder>
          {data.length ? (
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
                        Drag data file or click to select file
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
        <Grid>
          <Grid.Col orderSm={2}>
            <FormatMultiSelect />
          </Grid.Col>
          <Grid.Col orderSm={1}>
            <QRCodePaper />
          </Grid.Col>
        </Grid>
      </Grid.Col>
    </Grid>
  );
}
