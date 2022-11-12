import {
  Group,
  Paper,
  Text,
  useMantineTheme,
  Button,
  ActionIcon,
  Title,
  Tooltip,
  Table,
  Box,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import {
  IconUpload,
  IconFileSpreadsheet,
  IconX,
  IconTrash,
} from "@tabler/icons";
import { showNotification } from "@mantine/notifications";
import { useState, useRef, forwardRef, createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as XLSX from "xlsx";
import { FixedSizeList } from "react-window";
import { set as setData } from "./dataSlice";
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
  const rowHeight = 32;
  const keys = [];
  if (data.length) for (let key of Object.keys(data[0])) keys.push(key);

  const theme = useMantineTheme();

  /** Context for cross component communication */
  const VirtualTableContext = createContext({
    top: 0,
    setTop: (value) => {},
    header: <></>,
    footer: <></>,
  });
  /** The virtual table. It basically accepts all of the same params as the original FixedSizeList.*/
  function VirtualTable({ row, header, footer, ...rest }) {
    const listRef = useRef();
    const [top, setTop] = useState(0);

    return (
      <VirtualTableContext.Provider value={{ top, setTop, header, footer }}>
        <FixedSizeList
          {...rest}
          innerElementType={Inner}
          onItemsRendered={(props) => {
            const style =
              listRef.current &&
              // @ts-ignore private method access
              listRef.current._getItemStyle(props.overscanStartIndex);
            setTop((style && style.top) || 0);

            // Call the original callback
            rest.onItemsRendered && rest.onItemsRendered(props);
          }}
          ref={(el) => (listRef.current = el)}
        >
          {row}
        </FixedSizeList>
      </VirtualTableContext.Provider>
    );
  }
  /** The Row component. This should be a table row, and noted that we don't use the style that regular `react-window` examples pass in.*/
  function Row({ index }) {
    return (
      <tr
        style={
          index % 2
            ? {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              }
            : null
        }
      >
        {/** Make sure your table rows are the same height as what you passed into the list... */}
        <td
          style={{
            fontWeight: "bold",
            color: theme.colors.gray[theme.colorScheme === "dark" ? 7 : 5],
          }}
        >
          {index}
        </td>
        {keys.map((k, j) => (
          <td style={{ height: rowHeight }} key={`td-${index}-${j}`}>
            {data[index][k]}
          </td>
        ))}
      </tr>
    );
  }
  /**
   * The Inner component of the virtual list. This is the "Magic".
   * Capture what would have been the top elements position and apply it to the table.
   * Other than that, render an optional header and footer.
   **/
  const Inner = forwardRef(function Inner({ children, ...rest }, ref) {
    const { header, footer, top } = useContext(VirtualTableContext);
    return (
      <div {...rest} ref={ref}>
        <Table
          fontSize="xs"
          style={{ top, position: "absolute", whiteSpace: "nowrap" }}
        >
          {header}
          <tbody>{children}</tbody>
          {footer}
        </Table>
      </div>
    );
  });

  return (
    <VirtualTable
      height={800}
      itemCount={data.length}
      itemSize={rowHeight}
      header={
        <thead>
          <tr>
            <th>#</th>
            {keys.map((k, i) => (
              <th key={`th-${i}`}>{k}</th>
            ))}
          </tr>
        </thead>
      }
      row={Row}
      footer={<></>}
    />
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
          h = rawData[x + range.row[0]]?.v?.toString() ?? x;
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
    <Box p="xl">
      <Group
        spacing={0}
        sx={(theme) => ({
          height: 28,
          color:
            theme.colorScheme === "dark"
              ? theme.colors.dark[0]
              : theme.colors.gray[8],
        })}
      >
        <Title order={6} mr="sm">
          Import Data
        </Title>
        {data.length && (
          <Tooltip label="Clear" withArrow>
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
          </Tooltip>
        )}
      </Group>
      <Paper shadow="xs" p={data.length ? 0 : "md"} withBorder>
        {data.length ? (
          <DataTable />
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
                    files[0].errors.some((e) => e.code === "file-invalid-type")
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
    </Box>
  );
}
