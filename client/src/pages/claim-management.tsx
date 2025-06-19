import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Upload, Save, Menu, Clock } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import OrderList from "@/components/order-list";
import OrderDetail from "@/components/order-detail";
import MemoSection from "@/components/memo-section";
import Sidebar from "@/components/sidebar";
import LogModal from "@/components/log-modal";
import type { Order } from "@shared/schema";

export default function ClaimManagement() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [linkSet, setLinkSet] = useState("1");

  const { data: allOrders = [], refetch } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Only update filtered orders when all orders change and no filter is active
  useEffect(() => {
    if (!isFiltered && allOrders.length > 0) {
      setFilteredOrders(prevFiltered => {
        // Only update if the arrays are actually different
        if (prevFiltered.length !== allOrders.length || 
            !prevFiltered.every(order => allOrders.some(allOrder => allOrder.id === order.id))) {
          return allOrders;
        }
        return prevFiltered;
      });
    }
  }, [allOrders, isFiltered]);

  const handleFilterOrders = (orders: Order[]) => {
    setFilteredOrders(orders);
    // Check if this is showing all orders or a filtered subset
    const isShowingAll = orders.length === allOrders.length && 
                        orders.every(order => allOrders.some(allOrder => allOrder.id === order.id));
    setIsFiltered(!isShowingAll);
  };

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        
        try {
          const response = await fetch("/api/upload-excel", {
            method: "POST",
            body: formData,
          });
          
          const result = await response.json();
          
          if (response.ok) {
            refetch();
            setLastSaved(new Date().toLocaleString("ko-KR"));
            // Show success message
            alert(`성공: ${result.message}`);
          } else {
            alert(`오류: ${result.message}`);
          }
        } catch (error) {
          console.error("File upload failed:", error);
          alert("파일 업로드 중 오류가 발생했습니다.");
        }
      }
    };
    input.click();
  };

  const handleSave = () => {
    setLastSaved(new Date().toLocaleString("ko-KR"));
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-material-2 relative z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-xl font-medium text-on-surface">클레임 관리 시스템</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleFileUpload}
                className="bg-primary text-white hover:bg-primary-dark"
              >
                <Upload className="w-4 h-4 mr-2" />
                Excel 업로드
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-secondary text-white hover:bg-secondary-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>마지막 저장: {lastSaved || "저장된 기록 없음"}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          orders={allOrders}
          onRefetch={refetch}
          onFilterOrders={handleFilterOrders}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Order List Table */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="h-full p-6 overflow-auto">
                <OrderList 
                  orders={filteredOrders}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                  onRefetch={refetch}
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle />
            
            {/* Bottom Panel */}
            <ResizablePanel defaultSize={40} minSize={20}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={35} minSize={25}>
                  <OrderDetail order={selectedOrder} onUpdate={refetch} linkSet={linkSet} />
                </ResizablePanel>
                
                <ResizableHandle />
                
                <ResizablePanel defaultSize={65} minSize={35}>
                  <MemoSection 
                    order={selectedOrder} 
                    onUpdate={refetch}
                    linkSet={linkSet}
                    onLinkSetChange={setLinkSet}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      {/* Floating Action Button for Log */}
      <Button
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 shadow-material-3 hover:bg-primary-dark"
        onClick={() => setLogModalOpen(true)}
      >
        <Clock className="w-6 h-6" />
      </Button>

      {/* Log Modal */}
      <LogModal 
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
      />
    </div>
  );
}
