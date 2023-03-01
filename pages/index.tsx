import Head from "next/head";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { HeaderSimple } from "@/components/header";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";

export const defaultLocale = "en";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{t("Label Generator")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderSimple />
    </>
  );
}
