
#include <bits/stdc++.h>
using namespace std;
int main(){
    int n, q;
    cin >> n >> q;
    vector<int> arr(n);
    for (int i = 0; i < n;i++){
        cin >> arr[i];
    }
    vector<vector<int>> que(q);
    for (int i = 0; i < q;i++){
        int k;
        cin >> k;
        vector<int> ans(k);
        for (int j = 0; j < k;j++){
            cin >> ans[j];
        }
        que[i] = ans;
    }
    set<pair<int, int>> st;
    for (int i = 0; i < n;i++){
        st.insert({arr[i], i});
    }
    for (int i = 0; i < q; i++){
    vector<int> v = que[i];
    vector<int> removed;

    for (int j = 0; j < v.size(); j++){
        int ind = v[j]-1;
        st.erase({arr[ind], ind});
        removed.push_back(ind);
    }

    cout << st.begin()->first << endl;

    for(int ind : removed){
        st.insert({arr[ind], ind});
    }
}
}