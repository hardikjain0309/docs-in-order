import { createBrowserRouter } from "react-router"
import AppLayout from "./AppLayout"
import WorkspaceContent from "./workspace-content/WorkspaceContent"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    children: [
      {
        path: "/",
        Component: WorkspaceContent
      }
    ]
  }
])