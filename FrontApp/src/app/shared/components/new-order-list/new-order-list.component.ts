import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

interface Customer {
  image: string;
}

interface Order {
  product: string;
  customers: Customer[];
  extraCustomers?: number;
  total: string;
}

@Component({
  selector: 'app-new-order-list',
  imports: [MatTableModule, MatButtonModule],
  templateUrl: './new-order-list.component.html',
  styleUrl: './new-order-list.component.scss',
})
export class NewOrderListComponent {
  displayedColumns: string[] = ['product', 'customers', 'total'];

  // Sample data for orders
  ordersDatasource: Order[] = [
    {
      product: 'iPhone X',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$8999',
    },
    {
      product: 'Pixel 2',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$5550',
    },
    {
      product: 'OnePlus',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$9000',
    },
    {
      product: 'Galaxy',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$7500',
    },
    {
      product: 'Moto Z2',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$8500',
    },
    {
      product: 'iPhone X',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$8999',
    },
    {
      product: 'Pixel 2',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$5550',
    },
    {
      product: 'OnePlus',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$9000',
    },
    {
      product: 'Galaxy',
      customers: [
        { image: 'assets/images/user/user1.jpg' },
        { image: 'assets/images/user/user2.jpg' },
        { image: 'assets/images/user/user3.jpg' },
      ],
      extraCustomers: 4,
      total: '$7500',
    },
  ];
}
