import { Node } from "@/types/node";

export const mockData: Node = {
  id: "1",
  name: "Script",
  type: "ROOT",
  content: "Hello",
  status: "ACTIVE",
  children: [
    {
      id: "2",
      name: "Main Branch",
      type: "BRANCH",
      content: "content",
      status: "ACTIVE",
      children: [
        {
          id: "3",
          name: "Child 1",
          type: "BRANCH",
          content: "content",
          status: "ACTIVE",
          children: [],
        },
        {
          id: "4",
          name: "Child 2",
          content: "content",
          type: "BRANCH",
          status: "ACTIVE",
          children: [
            {
              id: "5",
              name: "Child 3",
              content: "content",
              type: "BRANCH",
              status: "ACTIVE",
              children: [
                {
                  id: "6",
                  name: "Child 4",
                  type: "BRANCH",
                  content: "content",
                  status: "ACTIVE",
                  children: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
