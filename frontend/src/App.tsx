import { Routes, Route, Navigate } from 'react-router-dom';
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { GroupLayout } from './layouts/GroupLayout';
import { HomePage } from './pages/storefront/HomePage';
import { CatalogPage } from './pages/storefront/CatalogPage';
import { ProductPage } from './pages/storefront/ProductPage';
import { CartPage } from './pages/storefront/CartPage';
import { CheckoutPage } from './pages/storefront/CheckoutPage';
import { AccountPage } from './pages/account/AccountPage';
import { CreateRoomPage } from './pages/room/CreateRoomPage';
import { JoinRoomPage } from './pages/room/JoinRoomPage';
import { GroupRoomPage } from './pages/room/GroupRoomPage';
import { PrivateInterviewPage } from './pages/room/PrivateInterviewPage';
import { RecommendationBoardPage } from './pages/room/RecommendationBoardPage';

export default function App() {
  return (
    <Routes>
      <Route element={<StorefrontLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/catalog/:category" element={<CatalogPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>
      <Route element={<GroupLayout />}>
        <Route path="/room/create" element={<CreateRoomPage />} />
        <Route path="/room/join" element={<JoinRoomPage />} />
        <Route path="/join/:code" element={<JoinRoomPage />} />
        <Route path="/room/:roomId" element={<GroupRoomPage />} />
        <Route path="/room/:roomId/interview" element={<PrivateInterviewPage />} />
        <Route path="/room/:roomId/results" element={<RecommendationBoardPage />} />
        {/* Legacy aliases and rerouting safety nets */}
        <Route path="/groups/:roomId" element={<GroupRoomPage />} />
        <Route path="/groups/:roomId/interview" element={<PrivateInterviewPage />} />
        <Route path="/groups/:roomId/results" element={<RecommendationBoardPage />} />
      </Route>
      {/* Short URL aliases */}
      <Route path="/room" element={<Navigate to="/room/join" replace />} />
      <Route path="/lobby" element={<Navigate to="/room/join" replace />} />
      <Route path="/interview" element={<Navigate to="/room/join" replace />} />
      <Route path="/results" element={<Navigate to="/room/join" replace />} />
      <Route path="/decision" element={<Navigate to="/room/join" replace />} />
      <Route path="/orders" element={<Navigate to="/account" replace />} />
      <Route path="/create" element={<Navigate to="/room/create" replace />} />
      <Route path="/join" element={<Navigate to="/room/join" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
