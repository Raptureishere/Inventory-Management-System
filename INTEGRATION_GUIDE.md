# Integration Guide - New Components

This guide shows how to integrate the new UI components into existing pages.

---

## 📦 Quick Start Integration

### Step 1: Import New Components

Add these imports to your component files:

```tsx
// Search and Filter
import SearchBar from './ui/SearchBar';
import AdvancedFilter, { FilterConfig, FilterValues } from './ui/AdvancedFilter';

// Export and Print
import ExportButton from './ui/ExportButton';
import PrintTemplate from './ui/PrintTemplate';

// Bulk Operations
import BulkActions from './ui/BulkActions';

// Pagination
import Pagination from './ui/Pagination';

// Notifications
import NotificationCenter, { Notification } from './ui/NotificationCenter';

// Export Utils
import { exportToCSV, exportToJSON, exportToExcel, flattenForExport } from '../utils/exportUtils';
```

---

## 🔧 Integration Example 1: Enhanced AddItems Component

Here's how to add search, filter, export, and bulk operations to `AddItems.tsx`:

### Add State Variables

```tsx
// Add these to existing state
const [selectedItems, setSelectedItems] = useState<number[]>([]);
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(20);
const [filterValues, setFilterValues] = useState<FilterValues>({});
```

### Define Filter Configuration

```tsx
const filterConfigs: FilterConfig[] = [
  {
    id: 'category',
    label: 'Category',
    type: 'multiselect',
    options: Object.entries(ItemCategoryLabels).map(([key, label]) => ({
      label,
      value: key
    }))
  },
  {
    id: 'quantity',
    label: 'Stock Quantity',
    type: 'number'
  },
  {
    id: 'dateReceived',
    label: 'Date Received',
    type: 'daterange'
  },
  {
    id: 'supplier',
    label: 'Supplier',
    type: 'select',
    options: [
      ...new Set(items.map(i => i.supplier))
    ].map(s => ({ label: s, value: s }))
  }
];
```

### Update Filtering Logic

```tsx
const filteredItems = useMemo(() => {
  let result = items;
  
  // Apply search
  if (searchTerm) {
    result = result.filter(item =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Apply category filter (multiselect)
  if (filterValues.category && filterValues.category.length > 0) {
    result = result.filter(item => filterValues.category.includes(item.category));
  }
  
  // Apply quantity filter
  if (filterValues.quantity_min) {
    result = result.filter(item => item.quantity >= Number(filterValues.quantity_min));
  }
  if (filterValues.quantity_max) {
    result = result.filter(item => item.quantity <= Number(filterValues.quantity_max));
  }
  
  // Apply date range filter
  if (filterValues.dateReceived_from) {
    result = result.filter(item => item.dateReceived >= filterValues.dateReceived_from);
  }
  if (filterValues.dateReceived_to) {
    result = result.filter(item => item.dateReceived <= filterValues.dateReceived_to);
  }
  
  // Apply supplier filter
  if (filterValues.supplier) {
    result = result.filter(item => item.supplier === filterValues.supplier);
  }
  
  return result.sort((a, b) => a.itemName.localeCompare(b.itemName));
}, [items, searchTerm, filterValues]);
```

### Add Pagination Logic

```tsx
const paginatedItems = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return filteredItems.slice(start, start + itemsPerPage);
}, [filteredItems, currentPage, itemsPerPage]);

// Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [searchTerm, filterValues]);
```

### Define Bulk Actions

```tsx
const bulkActions = [
  {
    id: 'export',
    label: 'Export Selected',
    icon: 'fa-download',
    onClick: (ids: number[]) => {
      const selectedData = items.filter(item => ids.includes(item.id));
      exportToCSV(selectedData, 'selected_items.csv');
      showToast(`Exported ${ids.length} items`, 'success');
    },
    variant: 'secondary' as const
  },
  {
    id: 'delete',
    label: 'Delete Selected',
    icon: 'fa-trash',
    onClick: async (ids: number[]) => {
      const updatedItems = items.filter(item => !ids.includes(item.id));
      setItems(updatedItems);
      itemStorage.save(updatedItems);
      setSelectedItems([]);
      showToast(`Deleted ${ids.length} items`, 'info');
    },
    variant: 'danger' as const,
    requiresConfirm: true
  }
];
```

### Update JSX with New Components

```tsx
return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-teal-800">Inventory Items</h1>
      <div className="flex items-center space-x-3">
        <ExportButton
          data={filteredItems}
          filename="inventory_items"
          headers={['id', 'itemCode', 'itemName', 'category', 'quantity', 'unit', 'dateReceived', 'supplier']}
        />
        {/* Existing import button */}
      </div>
    </div>

    {/* Search and Filter Bar */}
    <div className="flex items-center space-x-4">
      <SearchBar
        placeholder="Search by item name or code..."
        onSearch={setSearchTerm}
        className="flex-1"
      />
      <AdvancedFilter
        filters={filterConfigs}
        onApply={setFilterValues}
        onReset={() => setFilterValues({})}
        initialValues={filterValues}
      />
    </div>

    {/* Bulk Actions */}
    <BulkActions
      selectedCount={selectedItems.length}
      totalCount={filteredItems.length}
      actions={bulkActions}
      selectedIds={selectedItems}
      onSelectAll={() => setSelectedItems(filteredItems.map(i => i.id))}
      onClearSelection={() => setSelectedItems([])}
    />

    {/* Add Item Form */}
    {/* ... existing form ... */}

    {/* Items Table */}
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedItems.length === paginatedItems.length && paginatedItems.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems(paginatedItems.map(i => i.id));
                  } else {
                    setSelectedItems([]);
                  }
                }}
                className="rounded text-teal-600"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item Code</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Quantity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Unit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Supplier</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {paginatedItems.map(item => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedItems([...selectedItems, item.id]);
                    } else {
                      setSelectedItems(selectedItems.filter(id => id !== item.id));
                    }
                  }}
                  className="rounded text-teal-600"
                />
              </td>
              <td className="px-6 py-4 text-sm text-slate-900">{item.itemCode}</td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.itemName}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{ItemCategoryLabels[item.category]}</td>
              <td className="px-6 py-4 text-sm text-slate-900">{item.quantity}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
              <td className="px-6 py-4 text-sm text-slate-600">{item.supplier}</td>
              <td className="px-6 py-4 text-sm">
                {/* Existing action buttons */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <Pagination
      currentPage={currentPage}
      totalPages={Math.ceil(filteredItems.length / itemsPerPage)}
      totalItems={filteredItems.length}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onItemsPerPageChange={setItemsPerPage}
    />
  </div>
);
```

---

## 🔧 Integration Example 2: Print-Ready Store Issuing Voucher

Update `StoreIssuingVoucher.tsx` to add print functionality:

```tsx
import PrintTemplate from './ui/PrintTemplate';

const StoreIssuingVoucher: React.FC = () => {
  // ... existing code ...

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-teal-800">Store Issuing Voucher</h1>
      
      <PrintTemplate
        title={`Store Issuing Voucher - ${voucherId}`}
        headerInfo={[
          { label: 'Voucher ID', value: voucherId },
          { label: 'Requisition ID', value: requisition.id.toString() },
          { label: 'Department', value: requisition.departmentName },
          { label: 'Issue Date', value: issueDate },
          { label: 'Prepared By', value: user?.username || 'N/A' }
        ]}
      >
        <table className="w-full">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Requested Qty</th>
              <th>Issued Qty</th>
              <th>Balance After Issue</th>
            </tr>
          </thead>
          <tbody>
            {issuedItems.map((item, index) => (
              <tr key={index}>
                <td>{item.itemName}</td>
                <td>{item.requestedQty}</td>
                <td>{item.issuedQty}</td>
                <td>{item.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {notes && (
          <div className="mt-6">
            <strong>Notes:</strong>
            <p>{notes}</p>
          </div>
        )}
        
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p className="font-bold">Issued By:</p>
            <div className="mt-4 border-t border-slate-300 pt-2">
              <p>Signature & Date</p>
            </div>
          </div>
          <div>
            <p className="font-bold">Received By:</p>
            <div className="mt-4 border-t border-slate-300 pt-2">
              <p>Signature & Date</p>
            </div>
          </div>
        </div>
      </PrintTemplate>
    </div>
  );
};
```

---

## 🔧 Integration Example 3: Reports with Export

Update `Reports.tsx` to add export functionality:

```tsx
import ExportButton from './ui/ExportButton';
import AdvancedFilter from './ui/AdvancedFilter';
import { flattenForExport } from '../utils/exportUtils';

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportType, setReportType] = useState<'stock' | 'movement' | 'category'>('stock');
  const [filterValues, setFilterValues] = useState<FilterValues>({});

  const filterConfigs: FilterConfig[] = [
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'daterange'
    },
    {
      id: 'category',
      label: 'Category',
      type: 'multiselect',
      options: Object.entries(ItemCategoryLabels).map(([key, label]) => ({
        label,
        value: key
      }))
    }
  ];

  // Prepare data for export
  const exportData = useMemo(() => {
    return flattenForExport(reportData);
  }, [reportData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-teal-800">Reports</h1>
        <div className="flex items-center space-x-3">
          <AdvancedFilter
            filters={filterConfigs}
            onApply={setFilterValues}
            onReset={() => setFilterValues({})}
          />
          <ExportButton
            data={exportData}
            filename={`${reportType}_report`}
          />
        </div>
      </div>

      {/* Report content */}
      {/* ... */}
    </div>
  );
};
```

---

## 🔧 Integration Example 4: Global Notification System

Update `App.tsx` to add global notifications:

```tsx
import NotificationCenter, { Notification } from './components/ui/NotificationCenter';

const App: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Helper to add notifications
  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    action?: Notification['action']
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
      action
    };
    setNotifications(prev => [notification, ...prev]);
  }, []);

  // Notification handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClear = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  // Example: Add notification on low stock
  useEffect(() => {
    const items = itemStorage.get();
    const lowStockItems = items.filter(i => i.quantity < 10);
    
    if (lowStockItems.length > 0) {
      addNotification(
        'warning',
        'Low Stock Alert',
        `${lowStockItems.length} items are running low on stock`,
        {
          label: 'View Items',
          onClick: () => {
            // Navigate to inventory page
            window.location.hash = '/add-items';
          }
        }
      );
    }
  }, []);

  return (
    <ErrorBoundary>
      <UIProvider>
        <HashRouter>
          {/* ... existing routes ... */}
          
          {user && (
            <div className="fixed top-4 right-4 z-50">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onClear={handleClear}
                onClearAll={handleClearAll}
              />
            </div>
          )}
        </HashRouter>
      </UIProvider>
    </ErrorBoundary>
  );
};
```

---

## 📝 Common Patterns

### Pattern 1: Search + Filter + Export

```tsx
<div className="flex items-center space-x-4 mb-6">
  <SearchBar
    placeholder="Search..."
    onSearch={setSearchQuery}
    className="flex-1"
  />
  <AdvancedFilter
    filters={filterConfigs}
    onApply={setFilterValues}
    onReset={() => setFilterValues({})}
  />
  <ExportButton
    data={filteredData}
    filename="export"
  />
</div>
```

### Pattern 2: Bulk Actions + Pagination

```tsx
<>
  <BulkActions
    selectedCount={selected.length}
    totalCount={total}
    actions={bulkActions}
    selectedIds={selected}
    onSelectAll={handleSelectAll}
    onClearSelection={() => setSelected([])}
  />
  
  {/* Your data table */}
  
  <Pagination
    currentPage={page}
    totalPages={totalPages}
    totalItems={total}
    itemsPerPage={perPage}
    onPageChange={setPage}
    onItemsPerPageChange={setPerPage}
  />
</>
```

### Pattern 3: Print Template

```tsx
<PrintTemplate
  title="Document Title"
  headerInfo={[
    { label: 'ID', value: id },
    { label: 'Date', value: date }
  ]}
>
  {/* Your printable content */}
</PrintTemplate>
```

---

## ✅ Integration Checklist

- [ ] Import required components
- [ ] Add necessary state variables
- [ ] Update filtering/search logic
- [ ] Add pagination calculations
- [ ] Define bulk actions
- [ ] Update JSX with new components
- [ ] Test all functionality
- [ ] Verify mobile responsiveness
- [ ] Check accessibility (keyboard navigation)
- [ ] Test export functionality
- [ ] Test print layouts

---

## 🎨 Styling Tips

All new components use the existing teal theme and will match your current design automatically. If you need to customize:

```tsx
// Add custom classes
<SearchBar className="my-custom-class" />

// Override styles
<ExportButton className="!bg-blue-600 !hover:bg-blue-700" />
```

---

## 🐛 Troubleshooting

### Issue: Pagination not resetting on filter change
**Solution:** Add useEffect to reset page:
```tsx
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery, filterValues]);
```

### Issue: Export includes unwanted fields
**Solution:** Specify headers explicitly:
```tsx
<ExportButton
  data={data}
  headers={['id', 'name', 'quantity']} // Only these fields
/>
```

### Issue: Print template cuts off content
**Solution:** Check your content height and add page breaks:
```css
.page-break {
  page-break-after: always;
}
```

---

**All components are ready to use! Start integrating them into your pages.** 🚀
