import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";
import { GetServerSideProps } from "next";
import Head from "next/head";
import awsExports from "aws-exports";
import { createPost } from "graphql/mutations";
import { listPosts } from "graphql/queries";
import { GRAPHQL_AUTH_MODE } from "@aws-amplify/api-graphql/lib/types";
import styles from "styles/Home.module.css";
import { Post, CreatePostMutation } from "API";
import { GraphQLResult } from "@aws-amplify/api-graphql";

Amplify.configure({ ...awsExports, ssr: true });

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listPosts });

  return {
    props: {
      posts: response.data.listPosts.items,
    },
  };
};

const handleCreatePost = async (event: React.SyntheticEvent) => {
  event.preventDefault();

  const form = new FormData(event.target as HTMLFormElement);

  try {
    const { data } = (await API.graphql({
      authMode: GRAPHQL_AUTH_MODE.AMAZON_COGNITO_USER_POOLS,
      query: createPost,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    })) as GraphQLResult<CreatePostMutation>;
  } catch ({ errors }) {
    console.log(errors);
  }
};

const Home = ({ posts = [] }: { posts: Array<Post> }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Amplify + Next.js</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Amplify + Next.js</h1>

        <p className={styles.description}>
          <code className={styles.code}>{posts.length}</code>
          posts
        </p>

        <div className={styles.grid}>
          {posts.map((post) => (
            <a className={styles.card} href={`/posts/${post.id}`} key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </a>
          ))}

          <div className={styles.card}>
            <h3 className={styles.title}>New Post</h3>

            <AmplifyAuthenticator>
              <form onSubmit={handleCreatePost}>
                <fieldset>
                  <legend>Title</legend>
                  <input
                    defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
                    name="title"
                  />
                </fieldset>

                <fieldset>
                  <legend>Content</legend>
                  <textarea
                    defaultValue="I build an Amplify app with Next.js!"
                    name="content"
                  />
                </fieldset>

                <button>CreatePost</button>
                <button type="button" onClick={() => Auth.signOut()}>
                  Sign Out
                </button>
              </form>
            </AmplifyAuthenticator>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
