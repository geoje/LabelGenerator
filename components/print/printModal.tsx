import { RECOMMENDED_COUNT } from "@/lib/printSlice";
import {
  Group,
  Text,
  Modal,
  useMantineTheme,
  Button,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useTranslation } from "next-i18next";

export function PrintModal(props: any) {
  const qty = props.qty;
  const opened = props.opened;
  const close = props.close;
  const onAgree = props.onAgree;
  const onDisagree = props.onDisagree;

  const theme = useMantineTheme();
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="auto"
      title={
        <Group>
          <IconAlertTriangle size={48} color="#FAB005" />
          <Title order={4}>{t("Bulk Print Warning")}</Title>
        </Group>
      }
      overlayColor={
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[2]
      }
      overlayOpacity={0.55}
      overlayBlur={3}
    >
      <Text>
        {t("You tried to print")} <b>{qty.toLocaleString()}</b>{" "}
        {t("copies more than {0} that recommended").replace(
          "{0}",
          RECOMMENDED_COUNT.toLocaleString()
        )}
      </Text>
      <Text>
        {t(
          "It causes the browser to freeze, but you can print after waiting for rendering"
        )}
      </Text>
      <Text mt="xs">{t("Are you still going to proceed?")}</Text>

      <Group mt="xl" position="apart">
        <Button onClick={onDisagree}>{t("No, I will not print")}</Button>
        <Button onClick={onAgree} variant="outline">
          {t("Yes, I will print")}
        </Button>
      </Group>
    </Modal>
  );
}
