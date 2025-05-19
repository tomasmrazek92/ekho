function runFs() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      if (!listInstances?.length) return;

      const listInstance = listInstances[0];
      const currentPath = window.location.pathname.replace(/^\//, '');

      listInstance.effect(() => {
        const items = listInstance.items.value;
        if (!items?.length) return;

        processItems(items, currentPath, listInstance);
      });
    },
  ]);

  function processItems(items, currentPath, listInstance) {
    // Collect fields for all items first
    items.forEach((item) => {
      if (typeof item.collectFields === 'function') {
        item.collectFields();
      }
    });

    // Handle items with nesting separately
    const itemsWithNesting = items.filter((item) => item.nesting instanceof Promise);

    if (itemsWithNesting.length) {
      Promise.all(itemsWithNesting.map((item) => item.nesting))
        .then(() => filterAndRemoveItems(items, currentPath, listInstance))
        .catch((err) => console.error('Nesting error:', err));
    } else {
      filterAndRemoveItems(items, currentPath, listInstance);
    }
  }

  function filterAndRemoveItems(items, currentPath, listInstance) {
    // Filter items based on building-block fields
    const filteredItems = items.filter((item) => {
      const blockFields = item.element?.querySelectorAll('[fs-list-field="building-block"]');

      if (!blockFields || blockFields.length === 0) {
        removeElement(item.element);
        return false;
      }

      // Check if any building-block field matches the current path
      const isMatch = Array.from(blockFields).some((field) => {
        const blockValue = field.textContent.trim();
        return blockValue.includes(currentPath) || currentPath.includes(blockValue);
      });

      if (!isMatch) {
        removeElement(item.element);
      }

      return isMatch;
    });

    // Direct DOM handling for any missed items
    const allListItems = listInstance.listElement.querySelectorAll('.w-dyn-item');
    allListItems.forEach((element) => {
      const blockFields = element.querySelectorAll('[fs-list-field="building-block"]');

      if (!blockFields || blockFields.length === 0) {
        removeElement(element);
        return;
      }

      const hasMatch = Array.from(blockFields).some((field) => {
        const fieldValue = field.textContent.trim();
        return fieldValue.includes(currentPath) || currentPath.includes(fieldValue);
      });

      if (!hasMatch) {
        removeElement(element);
      }
    });

    // Update list items if changed
    if (filteredItems.length !== items.length) {
      listInstance.items.value = filteredItems;
    }
  }

  function removeElement(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

// Initialize the function
$(document).ready(function () {
  runFs();
});

$(document).ready(runFs);
