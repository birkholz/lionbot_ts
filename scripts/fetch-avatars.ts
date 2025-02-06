import { db } from "@db/client"
import { cyclistsTable } from "@db/schema"
import { GraphQLClient, gql } from "graphql-request"

const GET_TAG_USERS = gql`
  query TagDetail($tagName: String!, $after: Cursor) {
    tag(tagName: $tagName) {
      users(after: $after) {
        edges {
          node {
            id
            username
            assets {
              image {
                location
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`

interface TagUsersResponse {
  tag: {
    users: {
      edges: Array<{
        node: {
          id: string
          username: string
          assets: {
            image: {
              location: string
            }
          }
        }
      }>
      pageInfo: {
        hasNextPage: boolean
        endCursor: string
      }
    }
  }
}

async function fetchAndStoreAvatars() {
  console.log("Starting avatar fetch...")

  const client = new GraphQLClient(
    "https://gql-graphql-gateway.prod.k8s.onepeloton.com/graphql",
    {
      headers: {
        Authorization: `Bearer ${process.env.PELOTON_TOKEN}`,
      },
    },
  )

  const allUsers: Array<{
    username: string
    user_id: string
    avatar_url: string
  }> = []
  let hasNextPage = true
  let cursor: string | undefined = undefined

  while (hasNextPage) {
    try {
      console.log("Fetching page", cursor ? `after ${cursor}` : "1")
      const response: TagUsersResponse = await client.request<TagUsersResponse>(
        GET_TAG_USERS,
        {
          tagName: "TheEggCarton",
          after: cursor,
        },
      )

      if (!response?.tag?.users?.edges) {
        throw new Error("Invalid response from Peloton API")
      }

      const users = response.tag.users.edges.map(
        (edge: TagUsersResponse["tag"]["users"]["edges"][0]) => ({
          username: edge.node.username,
          user_id: edge.node.id,
          avatar_url: edge.node.assets.image.location,
        }),
      )

      allUsers.push(...users)
      console.log(`Found ${users.length} users on this page`)

      hasNextPage = response.tag.users.pageInfo.hasNextPage
      cursor = response.tag.users.pageInfo.endCursor ?? undefined
    } catch (error) {
      console.error("Error fetching users:", error)
      process.exit(1)
    }
  }

  console.log(`\nTotal users found: ${allUsers.length}`)
  console.log("Storing in database...")

  try {
    await db
      .insert(cyclistsTable)
      .values(allUsers)
      .onConflictDoUpdate({
        target: cyclistsTable.username,
        set: {
          user_id: cyclistsTable.user_id,
          avatar_url: cyclistsTable.avatar_url,
        },
      })

    console.log("Successfully stored all avatars!")
  } catch (error) {
    console.error("Error storing avatars in database:", error)
    process.exit(1)
  }

  process.exit(0)
}

await fetchAndStoreAvatars()
process.exit(0)
