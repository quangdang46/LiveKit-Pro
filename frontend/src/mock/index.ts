import { Node } from "@/types/node";

export const mockData: Node = {
  id: 1,
  name: "kịch bản",
  type: "ROOT",
  content: "Chào",
  status: "ACTIVE",
  children: [
    {
      id: 2,
      name: "Main branch",
      type: "BRANCH",
      content: "content",
      status: "ACTIVE",
      children: [
        {
          id: 3,
          name: "Child 1",
          type: "CONDITION",
          content: "content",
          status: "ACTIVE",
          children: [],
        },
        {
          id: 4,
          name: "Child 2",
          type: "CONDITION",
          content: "content",
          status: "ACTIVE",
          children: [
            {
              id: 5,
              name: "Child 3",
              type: "BRANCH",
              content: "content",
              status: "ACTIVE",
              children: [
                {
                  id: 6,
                  name: "Child 4",
                  type: "CONDITION",
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
