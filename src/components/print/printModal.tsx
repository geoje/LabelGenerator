import { RECOMMENDED_COUNT } from "../../lib/printSlice";
import {
  Group,
  Text,
  Modal,
  useMantineTheme,
  Button,
  Title,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { FormattedMessage, useIntl } from "react-intl";

export function PrintModal(props: any) {
  const qty = props.qty;
  const opened = props.opened;
  const close = props.close;
  const onAgree = props.onAgree;
  const onDisagree = props.onDisagree;

  const theme = useMantineTheme();
  const intl = useIntl();

  return (
    <Modal
      opened={opened}
      onClose={close}
      size="auto"
      title={
        <Group>
          <IconAlertTriangle size={48} color="#FAB005" />
          <Title order={4}>
            <FormattedMessage id="Bulk Print Warning" />
          </Title>
        </Group>
      }
      overlayProps={{
        color:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[2],
        opacity: 0.55,
        blur: 3,
      }}
    >
      <Text>
        {intl.formatMessage({ id: "You tried to print" })}{" "}
        <b>{qty.toLocaleString()}</b>{" "}
        {intl
          .formatMessage({ id: "copies more than {0} that recommended" })
          .replace("{0}", RECOMMENDED_COUNT.toLocaleString())}
      </Text>
      <Text>
        {intl.formatMessage({
          id: "It causes the browser to freeze, but you can print after waiting for rendering",
        })}
      </Text>
      <Text mt="xs">
        {intl.formatMessage({ id: "Are you still going to proceed?" })}
      </Text>

      <Group mt="xl" position="apart">
        <Button onClick={onDisagree}>
          {intl.formatMessage({ id: "No, I will not print" })}
        </Button>
        <Button onClick={onAgree} variant="outline">
          {intl.formatMessage({ id: "Yes, I will print" })}
        </Button>
      </Group>
    </Modal>
  );
}
