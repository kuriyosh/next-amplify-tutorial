import { Amplify, API, withSSRContext } from "aws-amplify";
import Head from "next/head";
import { useRouter } from "next/router";
import awsExports from "aws-exports";
import { deletePost } from "graphql/mutations";
import { getPost, listPosts } from "graphql/queries";
import styles from "styles/Home.module.css";
import { Post } from "API";
import { GetStaticPaths } from "next";
import { GraphQLResult } from "@aws-amplify/api-graphql";
import { ListPostsQuery } from "API";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api-graphql/lib/types";

Amplify.configure({ ...awsExports, ssr: true });

export const getStaticPaths = async () => {
  const SSR = withSSRContext();
  const { data } = await SSR.API.graphql({ query: listPosts });
  const paths = data.listPosts.items.map((post: Post) => ({
    params: { id: post.id },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps = async ({ params }: any) => {
  const SSR = withSSRContext();
  const { data } = await SSR.API.graphql({
    query: getPost,
    variables: {
      id: params.id,
    },
  });

  return {
    props: {
      post: data.getPost,
    },
  };
};

export default function PostPage({ post }: { post: Post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading&hellip;</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
        query: deletePost,
        variables: {
          input: { id: post.id },
        },
      });

      window.location.href = "/";
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{post.title} – Amplify + Next.js</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{post.title}</h1>

        <p className={styles.description}>{post.content}</p>
      </main>

      <footer className={styles.footer}>
        <button onClick={handleDelete}>💥 Delete post</button>
      </footer>
    </div>
  );
}
