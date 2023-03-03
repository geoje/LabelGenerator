import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { HeaderSimple } from "@/components/header";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { useDispatch, useSelector } from "react-redux";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Paper,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useState } from "react";
import * as XLSX from "xlsx";
import { showNotification } from "@mantine/notifications";
import { StringReplaceAt } from "@/lib/tool";
import { MAX_FILE_SIZE, setData } from "@/lib/dataSlice";
import {
  IconFileSpreadsheet,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { DataTable } from "@/components/data/dataTable";
import { Dropzone } from "@mantine/dropzone";
import { MIME_TYPES } from "@mantine/dropzone";

export const defaultLocale = "en";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Home() {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.data.value);

  const theme = useMantineTheme();
  const [workbook, setWorkbook]: any = useState(null);
  const { t } = useTranslation();

  /** Raw Excel data to Array
   * {'A1': 'id', 'A2': 'abc', 'B1': 'pw', 'B2': '123', ...} to
   * [ {'id': 'abc', 'pw': '123'}, ...]
   */
  const refineData = (rawData: any) => {
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

    let refinedData: any = [];
    for (let i = range.row[0] + 1; i <= range.row[1]; i++) refinedData.push({});

    /** Excel header string increasement
     * A > B > ... > Z > AA > AB > ... > AZ > BA > BB > ... > ZZ > AAA > ...
     */
    const IncreaseAlpha = (a: string, i: number): string =>
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

  return (
    <>
      <Head>
        <title>{t("Data") + " - " + t("Label Generator")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderSimple />
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
            {t("Import data")}
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

                    const reader = new FileReader();
                    reader.onload = (event) => {
                      var wb = XLSX.read(event.target?.result, {
                        type: "binary",
                      });

                      // More than 2 sheets
                      if (wb.SheetNames.length >= 2) setWorkbook(wb as any);
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
                    reader.readAsBinaryString(files[0]);
                  }}
                  onReject={(files: any) => {
                    let noti: { title: string; message: string } = {
                      title: "",
                      message: "",
                    };

                    // More than 2 files are rejected
                    if (files.length >= 2)
                      noti = {
                        title: "Not single file",
                        message: "You must upload just single file",
                      };
                    else if (
                      files[0].errors.some(
                        (e: any) => e.code === "file-invalid-type"
                      )
                    )
                      noti = {
                        title: "Unsupported file type",
                        message: "File type must be one of (xlsx, xls, csv)",
                      };
                    else if (
                      files[0].errors.some(
                        (e: any) => e.code === "file-too-large"
                      )
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
                        {t("Drag data file or click to select file")}
                      </Text>
                      <Text size="sm" color="dimmed" inline mt={7}>
                        {t(
                          "Attach MS Excel or CSV file, file should not exceed 5mb"
                        )}
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              </Group>
              {workbook && (
                <>
                  <Text align="center" size="xl" mt="sm">
                    {t("Choose 1 sheet")}
                  </Text>
                  <Group position="center" mt="xs">
                    {workbook.SheetNames.map((name: any) => (
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
    </>
  );
}
