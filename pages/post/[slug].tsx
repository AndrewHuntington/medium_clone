import { GetStaticProps, NextPage } from "next";
import Header from "../../components/Header";
import { Post } from "../../typings";
import { sanityClient, urlFor } from "../../sanity";
import PortableText from "react-portable-text";

// tells Next.js how to figure out which paths to pre-render
export const getStaticPaths = async () => {
  const query = `*[_type == "post" ] {
    _id,
    slug {
    current
   }
  }`;

  const posts = await sanityClient.fetch(query);

  const paths = posts.map((post: Post) => ({
    params: {
      slug: post.slug.current,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

// works with getStaticPaths to populate the page w/post info
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `*[_type == "post" && slug.current == $slug ][0] {
    _id,
    _createdAt,
    title,
    author-> {
     name,
     image
   },
    description,
    mainImage,
    slug,
    body
  }`;

  const post = await sanityClient.fetch(query, {
    // this will replace the $slug in the query above
    slug: params?.slug,
  });

  if (!post) {
    // works with fallback: 'blocking' to deliver a 404 if no posts are found
    return { notFound: true };
  }

  return {
    props: {
      post,
    },
    // enables ISR (Incremental Static Regeneration)
    // updates old cached version of page every 60 seconds
    revalidate: 60,
  };
};

interface Props {
  post: Post;
}

const Post: NextPage<Props> = ({ post }: Props) => {
  return (
    <main>
      <Header />

      <img
        className="object-cover w-full h-40"
        src={urlFor(post.mainImage).url()!}
        alt=""
      />

      <article className="max-w-3xl p-5 mx-auto">
        <h1 className="mb-3 text-3xl mt-to">{post.title}</h1>
        <h2 className="text-xl font-light text-gray-500">{post.description}</h2>

        <div className="flex items-center space-x-2">
          <img
            className="w-10 h-10 rounded-full"
            src={urlFor(post.author.image).url()!}
            alt=""
          />
          <p className="text-sm font-extralight">
            Blog post by{" "}
            <span className="text-green-600">{post.author.name}</span> -
            Published at {new Date(post._createdAt).toLocaleString()}
          </p>
        </div>

        <div className="mt-10">
          {/* Works w/sanity to handle the rich text blog post from the db */}
          <PortableText
            className=""
            dataset={process.env.NEXT_PUBLIC_SANITY_DATASET!}
            projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!}
            content={post.body}
            serializers={{
              h1: (props: any) => (
                <h1 className="my-5 text-2xl font-bold" {...props}></h1>
              ),
              h2: (props: any) => (
                <h2 className="my-5 text-xl font-bold" {...props}></h2>
              ),
              h3: (props: any) => (
                <h3 className="my-5 text-lg font-bold" {...props}></h3>
              ),
              li: ({ children }: any) => (
                <li className="ml-4 list-disc">{children}</li>
              ),
              link: ({ children, href }: any) => (
                <a href={href} className="text-blue-500 hover:underline">
                  {children}
                </a>
              ),
            }}
          />
        </div>
      </article>
    </main>
  );
};

export default Post;
