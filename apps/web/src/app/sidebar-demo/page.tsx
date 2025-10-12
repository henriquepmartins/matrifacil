import SidebarDemo from "@/components/sidebar-demo";

export default function SidebarDemoPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Sidebar Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          This is a demonstration of the new sidebar component with hover
          animations. Hover over the sidebar to see it expand, and move your
          mouse away to see it collapse.
        </p>
        <SidebarDemo />
      </div>
    </div>
  );
}
