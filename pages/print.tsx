import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { HeaderSimple } from "@/components/header";
import { defaultLocale } from "@/pages";
import Head from "next/head";

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? defaultLocale, ["common"])),
  },
});

export default function Template() {
  const { t } = useTranslation("common");

  return (
    <>
      <Head>
        <title>{t("common:Title") + " - " + t("common:Womosoft")}</title>
      </Head>
      <HeaderSimple />
    </>
  );
}