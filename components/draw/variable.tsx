import { MAX_FILE_SIZE } from "@/lib/dataSlice";
import {
  convertSize,
  DETAIL_ICON_SIZE,
  GROUP_VAR,
  setLayerSize,
  setLayerVar,
  setLayerVarImg,
  TYPE,
} from "@/lib/drawSlice";
import { UNIT } from "@/lib/paperSlice";
import {
  Box,
  Button,
  CloseButton,
  FileButton,
  Grid,
  Group,
  Image as ManImage,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCode, IconPhoto, IconVariable } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";

export function Variable() {
  const dispatch = useDispatch();
  const data = useSelector((state: any) => state.data.value);
  const layoutPx = convertSize(
    useSelector((state: any) => state.draw.layout),
    UNIT.px
  );
  const layer = useSelector((state: any) => state.draw.layer);
  const page = useSelector((state: any) => state.draw.page);
  const selected = useSelector((state: any) => state.draw.selected);

  const { t } = useTranslation();

  if (selected === -1) return <></>;

  const header = (
    <Group position="center">
      <IconCode />
      <Title order={5}>{t("Variable")}</Title>
    </Group>
  );
  const valueComponent = ({
    value,
    label,
    group,
    onRemove,
    classNames,
    ...others
  }: any) => {
    return (
      <div {...others}>
        <Box
          sx={(theme: any) => ({
            display: "flex",
            cursor: "default",
            alignItems: "center",
            color:
              group === GROUP_VAR.DATA
                ? theme.colorScheme === "dark"
                  ? theme.colors.blue[1]
                  : theme.colors.blue[8]
                : theme.colorScheme === "dark"
                ? theme.colors.dark[0]
                : theme.colors.gray[7],
            backgroundColor:
              group === GROUP_VAR.DATA
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
            sx={(theme: any) => ({
              color:
                group === GROUP_VAR.DATA
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

  switch (layer[selected].type) {
    case TYPE.text:
    case TYPE.bar:
    case TYPE.qr:
      let createdLabel: any = {};
      return (
        <Stack>
          {header}
          <Paper px="xs" py={4} withBorder>
            <Text size="xs" sx={{ wordBreak: "break-all" }}>
              {data[page] && layer[selected].var
                ? layer[selected].var.reduce(
                    (str: any, o: any) =>
                      `${str}${
                        o.group === GROUP_VAR.DATA
                          ? data[page][o.value]
                          : o.label
                      }`,
                    ""
                  )
                : ""}
            </Text>
          </Paper>
          <MultiSelect
            size="xs"
            placeholder="Select items or create contstant"
            searchable
            creatable
            clearable
            maxDropdownHeight={400}
            transitionDuration={100}
            transition="pop-top-left"
            transitionTimingFunction="ease"
            data={(() => {
              const result = Object.keys(data.length ? data[0] : {}).map(
                (v) => {
                  return { value: v, label: v, group: GROUP_VAR.DATA };
                }
              );

              return result.concat(
                layer[selected].var?.filter(
                  (o1: any) =>
                    result.findIndex(
                      (o2) => o1.value === o2.value && o1.group === o2.group
                    ) < 0
                ) ?? []
              );
            })()}
            value={layer[selected].var?.map((v: any) => v.value) ?? []}
            valueComponent={valueComponent}
            getCreateLabel={(query) => `+ Create ${query}`}
            onCreate={(query) => {
              const item = {
                value: Math.random().toString(),
                label: query,
                group: GROUP_VAR.CONST,
              };

              // For quick access at onChange event
              createdLabel[item.value] = item.label;
              return item;
            }}
            onChange={(value) => {
              const keys = data.length ? Object.keys(data[0]) : [];
              let constVars = layer[selected].var
                ? layer[selected].var.filter(
                    (o: any) => o.group === GROUP_VAR.CONST
                  )
                : [];

              dispatch(
                setLayerVar({
                  index: selected,
                  var: value.map((v) => {
                    return keys.includes(v)
                      ? { value: v, label: v, group: GROUP_VAR.DATA }
                      : {
                          value: v,
                          label: createdLabel[v]
                            ? createdLabel[v]
                            : constVars.length
                            ? constVars[
                                constVars.findIndex((o: any) => o.value === v)
                              ].label
                            : "",
                          group: GROUP_VAR.CONST,
                        };
                  }),
                })
              );
            }}
          />
        </Stack>
      );
    case TYPE.image:
      let keys: any = Object.keys(layer[selected].var.img);
      if (layer[selected].var.format) {
        const fm = layer[selected].var.format;
        keys = Array.from(
          new Set([...keys, ...data.map((o: any) => o[fm])]).values()
        ).filter((v) => v.length);
      }

      return (
        <Grid>
          <Grid.Col>{header}</Grid.Col>
          <Grid.Col>
            <FileButton
              accept="image/*"
              onChange={(file: any) => {
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
                    setLayerVar({
                      index: selected,
                      var: { ...layer[selected].var, default: url },
                    })
                  );

                  dispatch(
                    setLayerSize({
                      index: selected,
                      size: {
                        ...layer[selected].size,
                        x: layoutPx.w / 2 - w / 2,
                        y: layoutPx.h / 2 - h / 2,
                        w,
                        h,
                        nw: w,
                        nh: h,
                      },
                    })
                  );
                };

                img.src = url;
              }}
            >
              {(props) => (
                <Button
                  compact
                  size="xs"
                  variant="default"
                  rightIcon={
                    <ManImage
                      height={DETAIL_ICON_SIZE}
                      src={layer[selected].var.default}
                    />
                  }
                  {...props}
                  styles={(theme) => ({
                    root: {
                      fontWeight: 400,
                      color: theme.colorScheme === "dark" ? "#C1C2C5" : "#000",
                    },
                    rightIcon: {
                      marginLeft: "auto",
                    },
                  })}
                >
                  Default
                </Button>
              )}
            </FileButton>
          </Grid.Col>
          <Grid.Col>
            <Select
              placeholder="Data column"
              size="xs"
              clearable
              transitionDuration={100}
              transition="pop-top-left"
              transitionTimingFunction="ease"
              icon={<IconVariable size={DETAIL_ICON_SIZE} />}
              data={Object.keys(data.length ? data[0] : []).map((s) => {
                return { value: s, label: s };
              })}
              value={layer[selected].var.format}
              onChange={(value) => {
                let img: any = {};
                if (value)
                  new Set(data.map((o: any) => o[value])).forEach(
                    (v: any) => (img[v] = "")
                  );

                dispatch(
                  setLayerVar({
                    index: selected,
                    var: { ...layer[selected].var, format: value, img },
                  })
                );
              }}
            />
          </Grid.Col>
          {layer[selected].var.img && (
            <Grid.Col>
              <Grid>
                {keys.map((k: any) => (
                  <Grid.Col key={`variable-${k}`} span={3} md={12} py={0}>
                    <FileButton
                      accept="image/*"
                      onChange={(file) => {
                        // Empty
                        if (!file) return;

                        // No image type
                        if (!file.type.startsWith("image/")) {
                          showNotification({
                            title: "Unsupported file type",
                            message:
                              "File type must be one of (png, jpg, svg, ...)",
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
                          const varImg = { ...layer[selected].var.img };
                          varImg[k] = url;
                          dispatch(
                            setLayerVarImg({
                              index: selected,
                              img: varImg,
                            })
                          );
                        };
                        img.src = url;
                      }}
                    >
                      {(props) => (
                        <Button
                          compact
                          size="xs"
                          variant="outline"
                          rightIcon={
                            layer[selected].var.img[k] ? (
                              <ManImage
                                height={DETAIL_ICON_SIZE}
                                src={layer[selected].var.img[k]}
                              />
                            ) : (
                              <IconPhoto size={DETAIL_ICON_SIZE} />
                            )
                          }
                          {...props}
                          styles={() => ({
                            root: {
                              fontWeight: 400,
                            },
                            rightIcon: {
                              marginLeft: "auto",
                            },
                          })}
                        >
                          {k}
                        </Button>
                      )}
                    </FileButton>
                  </Grid.Col>
                ))}
              </Grid>
            </Grid.Col>
          )}
        </Grid>
      );
    default:
      return <></>;
  }
}
